import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { CACHE_TAGS } from '../../../../server/services/site.service'

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

    const tagIds: number[] = Array.isArray(json.tagIds) ? json.tagIds.filter((id: unknown) => typeof id === 'number') : []

    const item = await prisma.article.create({
      data: {
        slug: json.slug || `article-${Date.now()}`,
        titleDe: json.titleDe || '',
        titleEn: json.titleEn || '',
        summaryDe: json.summaryDe || null,
        summaryEn: json.summaryEn || null,
        contentDe: json.contentDe || null,
        contentEn: json.contentEn || null,
        seoTitleDe: json.seoTitleDe || null,
        seoTitleEn: json.seoTitleEn || null,
        seoDescriptionDe: json.seoDescriptionDe || null,
        seoDescriptionEn: json.seoDescriptionEn || null,
        seoKeywordsDe: json.seoKeywordsDe || null,
        seoKeywordsEn: json.seoKeywordsEn || null,
        coverImageId: typeof json.coverImageId === 'number' ? json.coverImageId : null,
        coverImageUrl: typeof json.coverImageUrl === 'string' ? json.coverImageUrl : null,
        isPublished: Boolean(json.isPublished),
        publishedAt: json.isPublished ? (json.publishedAt ? new Date(json.publishedAt) : new Date()) : null,
        sortOrder: Number(json.sortOrder) || 0,
        source: json.source === 'AI_GENERATED' ? 'AI_GENERATED' : 'MANUAL',
        tags: tagIds.length > 0
          ? { create: tagIds.map((tagId: number) => ({ tagId })) }
          : undefined,
      },
    })

    revalidateTag(CACHE_TAGS.articles)

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/articles] POST unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
