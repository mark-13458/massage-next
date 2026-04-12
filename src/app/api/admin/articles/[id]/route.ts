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
      return apiError('Invalid article id', 400)
    }

    const coverImageId =
      json.coverImageId === null
        ? null
        : typeof json.coverImageId === 'number' && Number.isFinite(json.coverImageId)
          ? json.coverImageId
          : undefined

    // 处理标签更新：删除旧关联，重建新关联
    const tagIds: number[] | undefined = Array.isArray(json.tagIds)
      ? json.tagIds.filter((tid: unknown) => typeof tid === 'number')
      : undefined

    const item = await prisma.article.update({
      where: { id },
      data: {
        slug: typeof json.slug === 'string' ? json.slug : undefined,
        titleDe: typeof json.titleDe === 'string' ? json.titleDe : undefined,
        titleEn: typeof json.titleEn === 'string' ? json.titleEn : undefined,
        summaryDe: typeof json.summaryDe === 'string' ? json.summaryDe : undefined,
        summaryEn: typeof json.summaryEn === 'string' ? json.summaryEn : undefined,
        contentDe: typeof json.contentDe === 'string' ? json.contentDe : undefined,
        contentEn: typeof json.contentEn === 'string' ? json.contentEn : undefined,
        seoTitleDe: typeof json.seoTitleDe === 'string' ? json.seoTitleDe : undefined,
        seoTitleEn: typeof json.seoTitleEn === 'string' ? json.seoTitleEn : undefined,
        seoDescriptionDe: typeof json.seoDescriptionDe === 'string' ? json.seoDescriptionDe : undefined,
        seoDescriptionEn: typeof json.seoDescriptionEn === 'string' ? json.seoDescriptionEn : undefined,
        seoKeywordsDe: typeof json.seoKeywordsDe === 'string' ? json.seoKeywordsDe : undefined,
        seoKeywordsEn: typeof json.seoKeywordsEn === 'string' ? json.seoKeywordsEn : undefined,
        coverImageId,
        coverImageUrl: typeof json.coverImageUrl === 'string' ? json.coverImageUrl : undefined,
        isPublished: typeof json.isPublished === 'boolean' ? json.isPublished : undefined,
        publishedAt: json.publishedAt ? new Date(json.publishedAt) : undefined,
        sortOrder: typeof json.sortOrder === 'number' ? json.sortOrder : undefined,
        // 标签：先全删再重建
        ...(tagIds !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: tagIds.map((tagId: number) => ({ tagId })),
              },
            }
          : {}),
      },
    })

    revalidateTag(CACHE_TAGS.articles)

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/articles] PATCH unexpected error:', error)
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
      return apiError('Invalid article id', 400)
    }

    await prisma.article.delete({ where: { id } })
    revalidateTag(CACHE_TAGS.articles)
    return apiOk()
  } catch (error) {
    console.error('[admin/articles] DELETE unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
