import { apiError, apiOk } from '../../../../../lib/api-response'
import { getAppointmentByToken } from '../../../../../server/services/admin-booking.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(_: Request, { params }: { params: { token: string } }) {
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
