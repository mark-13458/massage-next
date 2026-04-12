import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { generateArticleFromKeyword } from '../../../../../server/services/article-generator.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 120

/** POST /api/admin/articles/generate — 管理员手动触发 AI 生成文章 */
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const result = await generateArticleFromKeyword()

    if (!result) {
      return apiOk({ success: true, message: '没有待用关键词 / No pending keywords', articleId: null })
    }

    return apiOk({
      success: true,
      message: `文章已生成: ${result.keyword}`,
      articleId: result.articleId,
      keyword: result.keyword,
    })
  } catch (error) {
    console.error('[admin/articles/generate] error:', error)
    return apiError(error instanceof Error ? error.message : 'Generation failed', 500)
  }
}
