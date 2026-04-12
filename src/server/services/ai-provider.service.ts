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
      model: settings.model,
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
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
      model: settings.model,
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
