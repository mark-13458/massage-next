import { getAdminGalleryItems } from '../repositories/admin/media.repository'
import { toAdminGalleryCard } from '../view-models/admin/media.vm'

export async function getAdminGalleryOverview(filter: 'all' | 'active' | 'inactive' | 'cover' | 'local' = 'all') {
  if (!process.env.DATABASE_URL) {
    return { items: [], stats: { total: 0, active: 0, covers: 0, localUploads: 0 } }
  }

  try {
    const items = await getAdminGalleryItems()

    const filteredItems = items.filter((item) => {
      if (filter === 'active') return item.isActive
      if (filter === 'inactive') return !item.isActive
      if (filter === 'cover') return item.isCover
      if (filter === 'local') return item.file.filePath.startsWith('/uploads/')
      return true
    })

    return {
      items: filteredItems.map(toAdminGalleryCard),
      stats: {
        total: items.length,
        active: items.filter((item) => item.isActive).length,
        covers: items.filter((item) => item.isCover).length,
        localUploads: items.filter((item) => item.file.filePath.startsWith('/uploads/')).length,
      },
    }
  } catch {
    return { items: [], stats: { total: 0, active: 0, covers: 0, localUploads: 0 } }
  }
}
