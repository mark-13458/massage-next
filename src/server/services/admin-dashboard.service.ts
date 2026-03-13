import { getAdminDashboardCounts } from '../repositories/admin/dashboard.repository'

export async function getAdminDashboardStats() {
  if (!process.env.DATABASE_URL) {
    return {
      appointmentsTotal: 0,
      pendingAppointments: 0,
      servicesTotal: 0,
      testimonialsTotal: 0,
    }
  }

  return getAdminDashboardCounts()
}
