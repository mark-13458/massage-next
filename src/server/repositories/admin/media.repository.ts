import { prisma } from '../../../lib/prisma'

export async function getAdminGalleryItems() {
  return prisma.galleryImage.findMany({
    include: { file: true },
    orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
}
