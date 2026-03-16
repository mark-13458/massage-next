import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../../lib/prisma'

export type FindAdminAppointmentsOptions = {
  status?: AppointmentStatus
  dateFrom?: Date
  dateTo?: Date
  page?: number
  pageSize?: number
}

export async function findAdminAppointments(opts: FindAdminAppointmentsOptions = {}) {
  const { status, dateFrom, dateTo, page = 1, pageSize = 50 } = opts
  const where = {
    ...(status ? { status } : {}),
    ...(dateFrom || dateTo
      ? {
          appointmentDate: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: { service: true },
      orderBy: [{ appointmentDate: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ])

  return { items, total, page, pageSize }
}

export async function findAdminAppointmentById(id: number) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { service: true, confirmedBy: true },
  })
}

export async function findAppointmentByToken(token: string) {
  return prisma.appointment.findUnique({
    where: { confirmationToken: token },
    include: { service: true },
  })
}
