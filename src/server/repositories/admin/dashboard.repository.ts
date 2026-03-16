import { prisma } from '../../../lib/prisma'

export async function getAdminDashboardCounts() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - todayStart.getDay())

  const [appointmentsTotal, pendingAppointments, servicesTotal, testimonialsTotal, todayAppointments, weekAppointments] = await Promise.all([
    prisma.appointment.count().catch(() => 0),
    prisma.appointment.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.service.count().catch(() => 0),
    prisma.testimonial.count({ where: { isPublished: true } }).catch(() => 0),
    prisma.appointment.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
    prisma.appointment.count({ where: { createdAt: { gte: weekStart } } }).catch(() => 0),
  ])

  return {
    appointmentsTotal,
    pendingAppointments,
    servicesTotal,
    testimonialsTotal,
    todayAppointments,
    weekAppointments,
  }
}
