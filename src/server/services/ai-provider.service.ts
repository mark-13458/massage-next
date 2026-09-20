import { prisma } from '../../lib/prisma'

export type AIProviderType = 'openrouter' | 'gemini' | 'claude'

export type AISettings = {
  provider: AIProviderType
  apiKey: string
  model: string
}

const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openrouter: 'google/gemini-2.0-flash-001',
  gemini: 'gemini-2.0-flash',
  claude: 'claude-sonnet-4-20250514',
}

/** 从 SiteSetting 读取 AI 配置 */
export async function getAISettings(): Promise<AISettings | null> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'aiSettings' } })
    if (!setting?.value) return null
    const v = setting.value as Record<string, unknown>
    const provider = (typeof v.provider === 'string' ? v.provider : 'openrouter') as AIProviderType
    const apiKey = typeof v.apiKey === 'string' ? v.apiKey : ''
    const model = typeof v.model === 'string' && v.model ? v.model : DEFAULT_MODELS[provider]
    if (!apiKey) return null
    return { provider, apiKey, model }
  } catch {
    return null
  }
}

/**
 * 模型 ID 白名单校验。
 *
 * Gemini 会把模型名拼进请求 URL 的路径段，若不加约束，形如
 * `../../other-endpoint` 的取值可让请求打到非预期的接口（CWE-918 SSRF），
 * 并可能导致 API Key 外泄。这里统一在出站前做严格校验。
 *
 * 允许的字符覆盖三家的合法模型名，例如：
 *   gemini-2.0-flash / claude-sonnet-4-20250514 / google/gemini-2.0-flash-001
 */
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,99}$/

function assertValidModelId(model: string): string {
  if (!MODEL_ID_PATTERN.test(model) || model.includes('..')) {
    throw new Error(`Invalid model id: ${JSON.stringify(model.slice(0, 50))}`)
  }
  return model
}

/** 统一的 AI 文本生成接口 */
export async function generateText(prompt: string, settings: AISettings): Promise<string> {
  switch (settings.provider) {
    case 'openrouter':
      return callOpenRouterAPI(prompt, settings)
    case 'gemini':
      return callGeminiAPI(prompt, settings)
    case 'claude':
      return callClaudeAPI(prompt, settings)
    default:
      throw new Error(`Unsupported AI provider: ${settings.provider}`)
  }
}

/** OpenRouter — OpenAI 兼容格式（也支持 Gemini/Claude/DeepSeek 等模型） */
async function callOpenRouterAPI(prompt: string, settings: AISettings): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: assertValidModelId(settings.model),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/** Google Gemini — 直接调用 generativelanguage API */
async function callGeminiAPI(prompt: string, settings: AISettings): Promise<string> {
  // 模型名作为单个路径段编码，`/` 会被转义为 %2F，无法构成路径穿越
  const model = encodeURIComponent(assertValidModelId(settings.model))
  // API Key 改走请求头，避免出现在 URL、访问日志与中间代理中
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': settings.apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gemini API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/** Anthropic Claude — Messages API */
async function callClaudeAPI(prompt: string, settings: AISettings): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: assertValidModelId(settings.model),
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Claude API error ${res.status}: ${text}`)
  }

  const data = await res.json()
  const block = data.content?.find((b: { type: string }) => b.type === 'text')
  return block?.text || ''
}
