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
      return apiError('Invalid keyword id', 400)
    }

    const item = await prisma.keywordPool.update({
      where: { id },
      data: {
        keyword: typeof json.keyword === 'string' ? json.keyword : undefined,
        locale: typeof json.locale === 'string' ? json.locale : undefined,
        status: typeof json.status === 'string' ? (json.status as 'PENDING' | 'USED' | 'SKIPPED') : undefined,
      },
    })

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/keywords] PATCH unexpected error:', error)
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
      return apiError('Invalid keyword id', 400)
    }

    await prisma.keywordPool.delete({ where: { id } })
    return apiOk()
  } catch (error) {
    console.error('[admin/keywords] DELETE unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
