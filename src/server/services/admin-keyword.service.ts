import { findAllKeywords } from '../repositories/admin/keyword-pool.repository'

export async function getAdminKeywords() {
  if (!process.env.DATABASE_URL) return []
  try {
    return await findAllKeywords()
  } catch {
    return []
  }
}
