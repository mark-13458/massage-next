import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { generateArticleFromKeyword, preflightGenerationCheck } from '../../../../../server/services/article-generator.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 30

/** POST /api/admin/articles/generate — 管理员手动触发 AI 生成文章 */
export async function POST() {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  // 快速预检（仅 DB 查询，< 100ms），不调用 LLM
  const preflight = await preflightGenerationCheck()

  if (!preflight.ok) {
    if (preflight.reason === 'no-settings') {
      return apiError('AI settings not configured. Please set up AI provider in admin settings.', 422)
    }
    return apiOk({ success: true, background: false, message: '没有待用关键词 / No pending keywords', articleId: null })
  }

  // 后台异步执行，不 await，立即返回避免 Cloudflare 524
  generateArticleFromKeyword().catch((e) =>
    console.error('[admin/articles/generate] background generation error:', e),
  )

  return apiOk({
    success: true,
    background: true,
    keyword: preflight.keyword,
    message: `文章正在后台生成: ${preflight.keyword}`,
  })
}
