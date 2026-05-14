import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { generateText, AIProviderType } from '../../../../../server/services/ai-provider.service'

const AI_SETTINGS_KEY = 'aiSettings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/** 获取 AI 设置 */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  const setting = await prisma.siteSetting.findUnique({ where: { key: AI_SETTINGS_KEY } })
  const value = setting?.value as Record<string, unknown> | null

  // 返回时隐藏 API Key 中间部分
  if (value && typeof value.apiKey === 'string' && value.apiKey.length > 8) {
    const key = value.apiKey
    value.apiKey = key.slice(0, 4) + '****' + key.slice(-4)
  }
  if (value && typeof value.pexelsApiKey === 'string' && value.pexelsApiKey.length > 8) {
    const key = value.pexelsApiKey as string
    value.pexelsApiKey = key.slice(0, 4) + '****' + key.slice(-4)
  }
  if (value && typeof value.imageGenApiKey === 'string' && value.imageGenApiKey.length > 8) {
    const key = value.imageGenApiKey as string
    value.imageGenApiKey = key.slice(0, 4) + '****' + key.slice(-4)
  }

  return apiOk({ value: value ?? null })
}

/** 保存 AI 设置 */
export async function PATCH(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const json = await request.json()

    const existing = await prisma.siteSetting.findUnique({ where: { key: AI_SETTINGS_KEY } })
    const prev = (existing?.value && typeof existing.value === 'object' && !Array.isArray(existing.value)
      ? existing.value
      : {}) as Record<string, unknown>

    const merged: Record<string, unknown> = { ...prev }

    const validProviders: AIProviderType[] = ['openrouter', 'gemini', 'claude']
    if (typeof json.provider === 'string' && validProviders.includes(json.provider as AIProviderType)) {
      merged.provider = json.provider
    }

    // 只有当传入的不是 mask 时才更新 apiKey
    if (typeof json.apiKey === 'string' && !json.apiKey.includes('****')) {
      merged.apiKey = json.apiKey
    }

    if (typeof json.model === 'string') {
      merged.model = json.model
    }

    // Pexels API Key
    if (typeof json.pexelsApiKey === 'string' && !json.pexelsApiKey.includes('****')) {
      merged.pexelsApiKey = json.pexelsApiKey
    }

    // Image generation settings
    const validImageProviders = ['huggingface', 'openai', 'stability']
    if (typeof json.imageGenProvider === 'string' && validImageProviders.includes(json.imageGenProvider)) {
      merged.imageGenProvider = json.imageGenProvider
    }
    if (typeof json.imageGenApiKey === 'string' && !json.imageGenApiKey.includes('****')) {
      merged.imageGenApiKey = json.imageGenApiKey
    }

    await prisma.siteSetting.upsert({
      where: { key: AI_SETTINGS_KEY },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { value: merged as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { key: AI_SETTINGS_KEY, value: merged as any },
    })

    return apiOk({ success: true })
  } catch (error) {
    console.error('[admin/settings/ai] PATCH error:', error)
    return apiError('Internal server error', 500)
  }
}

/** 测试 AI 连接 */
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

    // 如果 apiKey 是 mask，则从数据库读取真实的 key
    let apiKey = typeof json.apiKey === 'string' ? json.apiKey : ''
    if (apiKey.includes('****')) {
      const existing = await prisma.siteSetting.findUnique({ where: { key: AI_SETTINGS_KEY } })
      const prev = existing?.value as Record<string, unknown> | null
      apiKey = typeof prev?.apiKey === 'string' ? prev.apiKey : ''
    }

    if (!apiKey) {
      return apiError('API Key is required for testing', 400)
    }

    const provider = (json.provider || 'openrouter') as AIProviderType
    const model = typeof json.model === 'string' && json.model ? json.model : undefined

    const settings = {
      provider,
      apiKey,
      model: model || (provider === 'openrouter' ? 'google/gemini-2.0-flash-001' : provider === 'gemini' ? 'gemini-2.0-flash' : 'claude-sonnet-4-20250514'),
    }

    const result = await generateText('Say "Hello, the connection is working!" in one short sentence.', settings)

    return apiOk({ success: true, response: result.substring(0, 200) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return apiOk({ success: false, error: message })
  }
}
