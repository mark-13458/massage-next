import { prisma } from '../../../lib/prisma'

export async function getAdminDashboardCounts() {
  const [appointmentsTotal, pendingAppointments, servicesTotal, testimonialsTotal] = await Promise.all([
    prisma.appointment.count().catch(() => 0),
    prisma.appointment.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.service.count().catch(() => 0),
    prisma.testimonial.count({ where: { isPublished: true } }).catch(() => 0),
  ])

  return {
    appointmentsTotal,
    pendingAppointments,
    servicesTotal,
    testimonialsTotal,
  }
}
