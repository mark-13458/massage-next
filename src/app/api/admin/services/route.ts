import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const json = await request.json()

    const item = await prisma.service.create({
      data: {
        slug: json.slug || `service-${Date.now()}`,
        nameDe: json.nameDe || '',
        nameEn: json.nameEn || '',
        summaryDe: json.summaryDe || null,
        summaryEn: json.summaryEn || null,
        descriptionDe: json.descriptionDe || null,
        descriptionEn: json.descriptionEn || null,
        durationMin: Number(json.durationMin) || 60,
        price: Number(json.price) || 0,
        sortOrder: Number(json.sortOrder) || 0,
        isFeatured: Boolean(json.isFeatured),
        isActive: typeof json.isActive === 'boolean' ? json.isActive : true,
      },
    })

    return apiOk({ item })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}
