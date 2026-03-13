import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../../lib/prisma'

export async function findAdminAppointments(status?: AppointmentStatus) {
  return prisma.appointment.findMany({
    where: status ? { status } : undefined,
    include: { service: true },
    orderBy: [{ createdAt: 'desc' }],
    take: 50,
  })
}

export async function findAdminAppointmentById(id: number) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { service: true, confirmedBy: true },
  })
}
