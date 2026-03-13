import { AppointmentStatus } from '@prisma/client'
import { findAdminAppointmentById, findAdminAppointments } from '../repositories/admin/booking.repository'

export async function getAdminAppointments(status: 'ALL' | AppointmentStatus = 'ALL') {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    return await findAdminAppointments(status === 'ALL' ? undefined : status)
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
