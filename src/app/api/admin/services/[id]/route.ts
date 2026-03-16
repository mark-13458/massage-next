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
      return apiError('Invalid service id', 400)
    }

    const item = await prisma.service.update({
      where: { id },
      data: {
        slug: typeof json.slug === 'string' ? json.slug : undefined,
        nameDe: typeof json.nameDe === 'string' ? json.nameDe : undefined,
        nameEn: typeof json.nameEn === 'string' ? json.nameEn : undefined,
        summaryDe: typeof json.summaryDe === 'string' ? json.summaryDe : undefined,
        summaryEn: typeof json.summaryEn === 'string' ? json.summaryEn : undefined,
        descriptionDe: typeof json.descriptionDe === 'string' ? json.descriptionDe : undefined,
        descriptionEn: typeof json.descriptionEn === 'string' ? json.descriptionEn : undefined,
        durationMin: typeof json.durationMin === 'number' ? json.durationMin : undefined,
        price: typeof json.price === 'number' ? json.price : undefined,
        sortOrder: typeof json.sortOrder === 'number' ? json.sortOrder : undefined,
        isActive: typeof json.isActive === 'boolean' ? json.isActive : undefined,
        isFeatured: typeof json.isFeatured === 'boolean' ? json.isFeatured : undefined,
      },
    })

    revalidateTag(CACHE_TAGS.services)

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/services] PATCH unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    if (!Number.isFinite(id)) {
      return apiError('Invalid service id', 400)
    }

    const appointmentsCount = await prisma.appointment.count({ where: { serviceId: id } })
    if (appointmentsCount > 0) {
      return apiError('Cannot delete service with related appointments', 400)
    }

    await prisma.service.delete({ where: { id } })
    revalidateTag(CACHE_TAGS.services)
    return apiOk()
  } catch (error) {
    console.error('[admin/services] DELETE unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
