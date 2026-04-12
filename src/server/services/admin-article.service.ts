import { findAdminArticleById, findAdminArticles } from '../repositories/admin/article.repository'
import { toAdminArticleListItem } from '../view-models/admin/article.vm'

export async function getAdminArticles() {
  if (!process.env.DATABASE_URL) return []
  try {
    const items = await findAdminArticles()
    return items.map(toAdminArticleListItem)
  } catch {
    return []
  }
}

export async function getAdminArticleDetail(id: number) {
  if (!process.env.DATABASE_URL) return null
  try {
    return await findAdminArticleById(id)
  } catch {
    return null
  }
}
