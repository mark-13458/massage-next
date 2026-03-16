import { NextRequest, NextResponse } from 'next/server'
import { bookingSchema } from '../../../lib/validations/booking'
import { verifyTurnstileToken } from '../../../lib/turnstile'
import { createBooking } from '../../../server/services/booking.service'
import { getSystemSettings } from '../../../server/services/site.service'
import { getIpAddress } from '../../../lib/utils'

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

    const remoteip = getIpAddress(request)

    if (systemSettings?.privacyConsentRequired !== false && !parsed.data.privacyConsent) {
      return NextResponse.json(
        { status: 'error', error: 'Privacy consent is required' },
        { status: 400 },
      )
    }

    const captcha = await verifyTurnstileToken(parsed.data.turnstileToken, remoteip)

    if (!captcha.ok) {
      return NextResponse.json(
        { status: 'error', error: captcha.error || 'Captcha verification failed' },
        { status: 400 },
      )
    }

    const booking = await createBooking(parsed.data, { ipAddress: remoteip ?? undefined })

    // Send notification emails (fire and forget to not block response)
    import('../../../server/services/mail.service').then(({ sendMerchantBookingNotification, sendCustomerReceivedEmail }) => {
      // 1. Notify merchant (Always sent unless SMTP is missing)
      sendMerchantBookingNotification(booking).catch(err => 
        console.error('Failed to send async merchant notification email:', err)
      )

      // 2. Notify customer (Received / Pending) - Checked against feature flag
      if (booking.customerEmail && systemSettings?.featureEnableEmailReminders !== false) {
        sendCustomerReceivedEmail(booking).catch(err => 
          console.error('Failed to send async customer received email:', err)
        )
      }
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
    console.error('[api/booking] unexpected error:', error)
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' },
      { status: 500 },
    )
  }
}
