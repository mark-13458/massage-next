import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { CACHE_TAGS } from '../../../../../server/services/site.service'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    const json = await request.json()

    if (!Number.isFinite(id)) {
      return apiError('Invalid gallery id', 400)
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id },
      include: { file: true },
    })

    if (!existing) {
      return apiError('Gallery item not found', 404)
    }

    const nextIsActive = typeof json.isActive === 'boolean' ? json.isActive : existing.isActive
    const nextIsCover = typeof json.isCover === 'boolean' ? json.isCover : existing.isCover

    if (nextIsCover) {
      await prisma.galleryImage.updateMany({
        where: { isCover: true, id: { not: id } },
        data: { isCover: false },
      })
    }

    const item = await prisma.galleryImage.update({
      where: { id },
      data: {
        isActive: nextIsActive,
        isCover: nextIsCover,
      },
      include: { file: true },
    })

    revalidateTag(CACHE_TAGS.gallery)

    return apiOk({
      item: {
        id: item.id,
        isActive: item.isActive,
        isCover: item.isCover,
        imageUrl: item.file.filePath,
      },
    })
  } catch (error) {
    console.error('[admin/gallery] unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}