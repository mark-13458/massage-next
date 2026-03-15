import { NextRequest, NextResponse } from 'next/server'
import { bookingSchema } from '../../../lib/validations/booking'
import { verifyTurnstileToken } from '../../../lib/turnstile'
import { createBooking } from '../../../server/services/booking.service'
import { getSystemSettings } from '../../../server/services/site.service'

const bookingRequestLog = new Map<string, number[]>()

export async function POST(request: NextRequest) {
  try {
    const systemSettings = await getSystemSettings().catch(() => null)
    const json = await request.json()
    const parsed = bookingSchema.safeParse({
      ...json,
      serviceId: Number(json.serviceId),
      privacyConsent: Boolean(json.privacyConsent),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid booking payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const forwardedFor = request.headers.get('x-forwarded-for')
    const remoteip = forwardedFor ? forwardedFor.split(',')[0]?.trim() : null

    if (systemSettings?.privacyConsentRequired !== false && !parsed.data.privacyConsent) {
      return NextResponse.json(
        { status: 'error', error: 'Privacy consent is required' },
        { status: 400 },
      )
    }

    const rateLimitWindowMin = systemSettings?.bookingRateLimitWindowMin || 15
    const rateLimitMaxRequests = systemSettings?.bookingRateLimitMaxRequests || 3
    const rateLimitWindowMs = rateLimitWindowMin * 60 * 1000
    const bookingIdentifier = `${remoteip || 'unknown'}:${parsed.data.customerPhone}:${parsed.data.customerEmail || '-'}`
    const now = Date.now()
    const previousAttempts = bookingRequestLog.get(bookingIdentifier) || []
    const recentAttempts = previousAttempts.filter((timestamp) => now - timestamp < rateLimitWindowMs)

    if (recentAttempts.length >= rateLimitMaxRequests) {
      return NextResponse.json(
        {
          status: 'error',
          error: `Too many booking attempts. Please try again later.`,
        },
        { status: 429 },
      )
    }

    recentAttempts.push(now)
    bookingRequestLog.set(bookingIdentifier, recentAttempts)

    const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, remoteip)

    if (!captcha.ok) {
      return NextResponse.json(
        { status: 'error', error: captcha.error || 'Captcha verification failed' },
        { status: 400 },
      )
    }

    const booking = await createBooking(parsed.data)

    // Send notification email (fire and forget to not block response)
    import('../../../server/services/mail.service').then(({ sendMerchantBookingNotification }) => {
      // Need to fetch full booking with service relation for email template
      // Or modify createBooking to return it. createBooking already includes service.
      // But type inference might need help. Let's trust createBooking return type.
      sendMerchantBookingNotification(booking as any).catch(err => 
        console.error('Failed to send async notification email:', err)
      )
    })

    return NextResponse.json({
      status: 'ok',
      booking: {
        id: booking.id,
        uuid: booking.uuid,
        status: booking.status,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
