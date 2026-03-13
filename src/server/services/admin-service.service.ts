import { findAdminServiceById, findAdminServices } from '../repositories/admin/service.repository'

export async function getAdminServices() {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    return await findAdminServices()
  } catch {
    return []
  }
}

export async function getAdminServiceDetail(id: number) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await findAdminServiceById(id)
  } catch {
    return null
  }
}
