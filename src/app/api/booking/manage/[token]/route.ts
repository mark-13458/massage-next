import { AppointmentStatus } from '@prisma/client'
import { apiError, apiOk } from '../../../../../lib/api-response'
import { bookingManageSchema } from '../../../../../lib/validations/booking'
import { prisma } from '../../../../../lib/prisma'
import { getAppointmentByToken } from '../../../../../server/services/admin-booking.service'
import { getSystemSettings } from '../../../../../server/services/site.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const settings = await getSystemSettings().catch(() => null)
  if (settings?.featureEnableBookingManage === false) {
    return apiError('Booking self-service is disabled', 403)
  }

  const token = params.token
  if (!token) {
    return apiError('Missing token', 400)
  }

  const appointment = await getAppointmentByToken(token)
  if (!appointment) {
    return apiError('Appointment not found', 404)
  }

  return apiOk({
    booking: {
      id: appointment.id,
      uuid: appointment.uuid,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      serviceName: appointment.service.nameDe,
      token: appointment.confirmationToken,
    },
  })
}

export async function PATCH(request: Request, { params }: { params: { token: string } }) {
  const settings = await getSystemSettings().catch(() => null)
  if (settings?.featureEnableBookingManage === false) {
    return apiError('Booking self-service is disabled', 403)
  }

  const token = params.token
  if (!token) {
    return apiError('Missing token', 400)
  }

  const appointment = await getAppointmentByToken(token)
  if (!appointment) {
    return apiError('Appointment not found', 404)
  }

  if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
    return apiError('Appointment can no longer be modified', 400)
  }

  const json = await request.json().catch(() => null)
  const parsed = bookingManageSchema.safeParse(json)

  if (!parsed.success) {
    return apiError('Invalid booking management payload', 400)
  }

  const { action, appointmentDate, appointmentTime, notes } = parsed.data

  if (action === 'cancel') {
    const auditNote = `Customer self-service cancel via secure link at ${new Date().toISOString()}`
    const item = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelledAt: new Date(),
        notes: typeof notes === 'string' ? notes : appointment.notes,
        internalNote: appointment.internalNote
          ? `${appointment.internalNote}\n${auditNote}`
          : auditNote,
      },
      include: { service: true },
    })

    // Async: Notify customer and merchant about cancellation
    import('../../../../../server/services/mail.service').then(({ sendCustomerCancelledEmail, sendMerchantBookingNotification }) => {
      const bookingData = item as any
      // Notify customer if enabled
      if (settings?.featureEnableEmailReminders !== false) {
        sendCustomerCancelledEmail(bookingData).catch(console.error)
      }
      // Send a merchant notification too so they know it was cancelled
      sendMerchantBookingNotification(bookingData).catch(console.error)
    })

    return apiOk({ item, action })
  }

  if (!appointmentDate || !appointmentTime) {
    return apiError('appointmentDate and appointmentTime are required for reschedule', 400)
  }

  const auditNote = `Customer self-service reschedule via secure link at ${new Date().toISOString()}`
  const item = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      notes: typeof notes === 'string' ? notes : appointment.notes,
      status: AppointmentStatus.PENDING,
      confirmedAt: null,
      confirmedById: null,
      cancelledAt: null,
      completedAt: null,
      internalNote: appointment.internalNote
        ? `${appointment.internalNote}\n${auditNote}`
        : auditNote,
    },
    include: { service: true },
  })

  // Async: Notify customer and merchant about reschedule (as a new request)
  import('../../../../../server/services/mail.service').then(({ sendCustomerReceivedEmail, sendMerchantBookingNotification }) => {
    const bookingData = item as any
    // Notify customer if enabled
    if (settings?.featureEnableEmailReminders !== false) {
      sendCustomerReceivedEmail(bookingData).catch(console.error)
    }
    sendMerchantBookingNotification(bookingData).catch(console.error)
  })

  return apiOk({ item, action })
}
