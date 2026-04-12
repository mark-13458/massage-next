import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    const json = await request.json()

    if (!Number.isFinite(id)) {
      return apiError('Invalid tag id', 400)
    }

    const item = await prisma.articleTag.update({
      where: { id },
      data: {
        slug: typeof json.slug === 'string' ? json.slug : undefined,
        nameDe: typeof json.nameDe === 'string' ? json.nameDe : undefined,
        nameEn: typeof json.nameEn === 'string' ? json.nameEn : undefined,
      },
    })

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/article-tags] PATCH unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const { id: idStr } = await params
    const id = Number(idStr)

    if (!Number.isFinite(id)) {
      return apiError('Invalid tag id', 400)
    }

    await prisma.articleTag.delete({ where: { id } })
    return apiOk()
  } catch (error) {
    console.error('[admin/article-tags] DELETE unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
