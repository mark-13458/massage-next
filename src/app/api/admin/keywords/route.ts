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
    const items = await prisma.keywordPool.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { article: { select: { id: true, slug: true, titleDe: true } } },
      take: 500,
    })
    return apiOk({ items })
  } catch (error) {
    console.error('[admin/keywords] GET unexpected error:', error)
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

    // 支持批量导入：keywords 为换行分隔的字符串
    if (typeof json.keywords === 'string') {
      const lines = json.keywords
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)

      if (lines.length === 0) {
        return apiError('No keywords provided', 400)
      }

      const locale = json.locale || 'de'
      const created = await prisma.keywordPool.createMany({
        data: lines.map((keyword: string) => ({ keyword, locale })),
      })

      return apiOk({ count: created.count })
    }

    // 单个添加
    if (!json.keyword) {
      return apiError('keyword is required', 400)
    }

    const item = await prisma.keywordPool.create({
      data: {
        keyword: json.keyword,
        locale: json.locale || 'de',
      },
    })

    return apiOk({ item })
  } catch (error) {
    console.error('[admin/keywords] POST unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
