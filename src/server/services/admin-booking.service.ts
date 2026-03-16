import { AppointmentStatus } from '@prisma/client'
import { findAdminAppointmentById, findAdminAppointments, findAppointmentByToken } from '../repositories/admin/booking.repository'
import { toAdminBookingListItem } from '../view-models/admin/booking.vm'

export type GetAdminAppointmentsOptions = {
  status?: AppointmentStatus | 'ALL'
  dateFrom?: Date
  dateTo?: Date
  page?: number
  pageSize?: number
}

export async function getAdminAppointments(opts: GetAdminAppointmentsOptions | 'ALL' = 'ALL') {
  if (!process.env.DATABASE_URL) return { items: [], total: 0, page: 1, pageSize: 50 }

  // 兼容旧调用方式 getAdminAppointments('ALL')
  const options: GetAdminAppointmentsOptions = opts === 'ALL' ? {} : opts
  const { status, ...rest } = options

  try {
    const result = await findAdminAppointments({
      status: status && status !== 'ALL' ? status : undefined,
      ...rest,
    })
    return {
      items: result.items.map(toAdminBookingListItem),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    }
  } catch {
    return { items: [], total: 0, page: 1, pageSize: 50 }
  }
}

export async function getAdminAppointmentDetail(id: number) {
  if (!process.env.DATABASE_URL) return null
  try {
    return await findAdminAppointmentById(id)
  } catch {
    return null
  }
}

export async function getAppointmentByToken(token: string) {
  if (!process.env.DATABASE_URL) return null
  try {
    return await findAppointmentByToken(token)
  } catch {
    return null
  }
}
