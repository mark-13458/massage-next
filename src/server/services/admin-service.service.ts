import { findAdminServiceById, findAdminServices } from '../repositories/admin/service.repository'
import { toAdminServiceListItem } from '../view-models/admin/service.vm'

export async function getAdminServices() {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    const items = await findAdminServices()
    return items.map(toAdminServiceListItem)
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
