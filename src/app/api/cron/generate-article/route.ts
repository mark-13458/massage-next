import { NextRequest } from 'next/server'
import { generateArticleFromKeyword } from '../../../../server/services/article-generator.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 120 // AI 生成可能耗时较长

/** GET /api/cron/generate-article — 定时任务 or 手动触发 */
export async function GET(request: NextRequest) {
  // 验证 CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await generateArticleFromKeyword()

    if (!result) {
      return Response.json({
        success: true,
        message: 'No pending keywords available',
        articleId: null,
      })
    }

    return Response.json({
      success: true,
      message: `Article generated for keyword: ${result.keyword}`,
      articleId: result.articleId,
      keyword: result.keyword,
    })
  } catch (error) {
    console.error('[cron/generate-article] error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
