import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const tags = await prisma.articleTag.findMany({
      orderBy: { nameDe: 'asc' },
      include: { _count: { select: { articles: true } } },
    })
    return apiOk({ items: tags })
  } catch (error) {
    console.error('[admin/article-tags] GET unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}

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

    if (!json.nameDe || !json.nameEn) {
      return apiError('nameDe and nameEn are required', 400)
    }

    const item = await prisma.articleTag.create({
      data: {
        slug: json.slug || json.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        nameDe: json.nameDe,
        nameEn: json.nameEn,
      },
    })

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/article-tags] POST unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
