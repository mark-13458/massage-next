import { NextRequest, NextResponse } from 'next/server'
import { bookingSchema } from '../../../lib/validations/booking'
import { createBooking } from '../../../server/services/booking.service'

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = bookingSchema.safeParse({
      ...json,
      serviceId: Number(json.serviceId),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid booking payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const booking = await createBooking(parsed.data)

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
