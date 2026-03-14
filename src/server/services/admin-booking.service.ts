import { AppointmentStatus } from '@prisma/client'
import { findAdminAppointmentById, findAdminAppointments, findAppointmentByToken } from '../repositories/admin/booking.repository'
import { toAdminBookingListItem } from '../view-models/admin/booking.vm'

export async function getAdminAppointments(status: 'ALL' | AppointmentStatus = 'ALL') {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    const items = await findAdminAppointments(status === 'ALL' ? undefined : status)
    return items.map(toAdminBookingListItem)
  } catch {
    return []
  }
}

export async function getAdminAppointmentDetail(id: number) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await findAdminAppointmentById(id)
  } catch {
    return null
  }
}

export async function getAppointmentByToken(token: string) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await findAppointmentByToken(token)
  } catch {
    return null
  }
}
