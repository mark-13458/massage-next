import { prisma } from '../../lib/prisma'
import { getAISettings, generateText } from './ai-provider.service'
import { getActiveServices } from './site.service'
import { getContactSettings } from './site.service'
import { findNextPendingKeyword } from '../repositories/admin/keyword-pool.repository'
import { CACHE_TAGS } from './site.service'
import { revalidateTag } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { getUploadDir, getPublicUrl } from '../../lib/uploads'

type GeneratedArticle = {
  titleDe: string
  titleEn: string
  summaryDe: string
  summaryEn: string
  contentDe: string
  contentEn: string
  seoTitleDe: string
  seoTitleEn: string
  seoDescriptionDe: string
  seoDescriptionEn: string
  seoKeywordsDe: string
  seoKeywordsEn: string
  suggestedTags: string[]
  slug: string
}

type ImageGenProvider = 'huggingface' | 'openai' | 'stability'

type ImageGenSettings = {
  provider: ImageGenProvider
  apiKey: string
}

/**
 * 快速预检：验证 AI 设置已配置且有待用关键词。
 * 仅做 DB 查询，不调用 LLM，用于 HTTP 路由立即返回前的检查。
 */
export async function preflightGenerationCheck(): Promise<
  | { ok: true; keyword: string }
  | { ok: false; reason: 'no-settings' | 'no-keywords' }
> {
  const aiSettings = await getAISettings()
  if (!aiSettings) {
    return { ok: false, reason: 'no-settings' }
  }
  const keyword = await findNextPendingKeyword()
  if (!keyword) {
    return { ok: false, reason: 'no-keywords' }
  }
  return { ok: true, keyword: keyword.keyword }
}

/**
 * 主入口：从关键词池取词 → AI 生成文章 → 立即存库发布 → 后台异步生成图片
 * 图片生成不阻塞返回，避免 Cloudflare 524 超时
 */
export async function generateArticleFromKeyword(): Promise<{ articleId: number; keyword: string } | null> {
  // 1. 获取 AI 设置
  const aiSettings = await getAISettings()
  if (!aiSettings) {
    throw new Error('AI settings not configured. Please set up AI provider in admin settings.')
  }

  // 2. 获取下一个 PENDING 关键词
  const keyword = await findNextPendingKeyword()
  if (!keyword) {
    return null // 无待用关键词
  }

  // 3. 收集网站信息用于内链和 CTA
  const services = await getActiveServices(keyword.locale === 'en' ? 'en' : 'de')
  const contact = await getContactSettings()

  // 4. 构建 prompt
  const prompt = buildArticlePrompt(keyword.keyword, keyword.locale, services, contact)

  // 5. 调用 AI 生成
  const rawResponse = await generateText(prompt, aiSettings)

  // 6. 解析 JSON
  const article = parseArticleResponse(rawResponse)

  // 7. 查找或创建标签
  const tagIds = await resolveTagIds(article.suggestedTags)

  // 8. 立即保存文章（无图片），避免超时
  const created = await prisma.article.create({
    data: {
      slug: article.slug || `article-${Date.now()}`,
      titleDe: article.titleDe,
      titleEn: article.titleEn,
      summaryDe: article.summaryDe || null,
      summaryEn: article.summaryEn || null,
      contentDe: article.contentDe || null,
      contentEn: article.contentEn || null,
      seoTitleDe: article.seoTitleDe || null,
      seoTitleEn: article.seoTitleEn || null,
      seoDescriptionDe: article.seoDescriptionDe || null,
      seoDescriptionEn: article.seoDescriptionEn || null,
      seoKeywordsDe: article.seoKeywordsDe || null,
      seoKeywordsEn: article.seoKeywordsEn || null,
      coverImageUrl: null,
      isPublished: true,
      publishedAt: new Date(),
      source: 'AI_GENERATED',
      keywordId: keyword.id,
      tags: tagIds.length > 0
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  })

  // 9. 更新关键词状态为 USED
  await prisma.keywordPool.update({
    where: { id: keyword.id },
    data: { status: 'USED', usedAt: new Date() },
  })

  // 10. 清除缓存，让文章立即可见
  revalidateTag(CACHE_TAGS.articles)

  // 11. 后台异步生成图片，不阻塞当前请求
  generateAndAttachImages(created.id, keyword.keyword, article.contentDe, article.contentEn).catch((e) =>
    console.error(`[image] background generation failed for article ${created.id}:`, e),
  )

  return { articleId: created.id, keyword: keyword.keyword }
}

/** 后台异步：生成图片后更新文章的封面和正文配图 */
async function generateAndAttachImages(
  articleId: number,
  keyword: string,
  contentDe: string,
  contentEn: string,
): Promise<void> {
  const imageUrls = await generateArticleImages(keyword, 3)
  if (imageUrls.length === 0) return

  const coverImageUrl = imageUrls[0]
  const updatedContentDe = imageUrls.length > 1 ? insertImagesIntoContent(contentDe, imageUrls, keyword) : contentDe
  const updatedContentEn = imageUrls.length > 1 ? insertImagesIntoContent(contentEn, imageUrls, keyword) : contentEn

  await prisma.article.update({
    where: { id: articleId },
    data: { coverImageUrl, contentDe: updatedContentDe, contentEn: updatedContentEn },
  })

  revalidateTag(CACHE_TAGS.articles)
  console.log(`[image] attached ${imageUrls.length} images to article ${articleId}`)
}

// ============================================================
// AI 图片生成
// ============================================================

/** 从 SiteSetting 读取图片生成配置 */
async function getImageGenSettings(): Promise<ImageGenSettings> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'aiSettings' } })
    const v = setting?.value as Record<string, unknown> | null
    return {
      provider: (typeof v?.imageGenProvider === 'string' ? v.imageGenProvider : 'huggingface') as ImageGenProvider,
      apiKey: typeof v?.imageGenApiKey === 'string' ? v.imageGenApiKey : '',
    }
  } catch {
    return { provider: 'huggingface', apiKey: '' }
  }
}

/** 构建图片生成 prompt — 面向视觉描述，避免模糊通用 */
function buildImagePrompt(keyword: string): string {
  return `serene traditional chinese medicine massage treatment room, professional therapist performing ${keyword} therapy, warm amber lighting, zen atmosphere, high-end wellness spa, photorealistic, no text, no watermark`
}

/** 将图片数据保存到 uploads 目录，返回公开路径 */
async function saveImageBuffer(buffer: Buffer, ext: string): Promise<string | null> {
  try {
    const filename = `${randomUUID()}${ext}`
    const uploadDir = getUploadDir()
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    await writeFile(join(uploadDir, filename), buffer)
    return getPublicUrl(filename)
  } catch (e) {
    console.error('[image] save error:', e)
    return null
  }
}

/** Hugging Face Inference API — FLUX.1-schnell，免费，支持重试（冷启动） */
async function generateHuggingFaceImage(
  keyword: string,
  apiKey: string,
  width: number,
  height: number,
): Promise<string | null> {
  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(
        'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: buildImagePrompt(keyword),
            parameters: { width, height, num_inference_steps: 4, guidance_scale: 0.0 },
          }),
        },
      )

      // 503 = 模型冷启动中，等待后重试
      if (res.status === 503) {
        const data = await res.json().catch(() => ({})) as Record<string, unknown>
        const waitMs = Math.min(((data.estimated_time as number) || 20) * 1000, 30000)
        if (attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, waitMs))
          continue
        }
        return null
      }

      if (!res.ok) {
        console.error(`[HuggingFace] API error ${res.status}`)
        return null
      }

      const buffer = Buffer.from(await res.arrayBuffer())
      return await saveImageBuffer(buffer, '.png')
    } catch (e) {
      console.error('[HuggingFace] generation error:', e)
      return null
    }
  }
  return null
}

/** DALL-E 3 — 生成图片并保存到本地（URL 有时效，必须下载） */
async function generateDalleImage(keyword: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: buildImagePrompt(keyword),
        n: 1,
        size: '1792x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    })
    if (!res.ok) {
      console.error(`[DALL-E] API error ${res.status}`)
      return null
    }
    const data = await res.json()
    const imageUrl = data.data?.[0]?.url
    if (!imageUrl) return null

    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    return await saveImageBuffer(buffer, '.png')
  } catch (e) {
    console.error('[DALL-E] generation error:', e)
    return null
  }
}

/** Stability AI (stable-image-core) — 生成图片并保存到本地 */
async function generateStabilityImage(
  keyword: string,
  apiKey: string,
  aspectRatio: '16:9' | '3:2',
): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('prompt', buildImagePrompt(keyword))
    formData.append('output_format', 'webp')
    formData.append('aspect_ratio', aspectRatio)

    const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'image/*' },
      body: formData,
    })
    if (!res.ok) {
      console.error(`[Stability] API error ${res.status}`)
      return null
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    return await saveImageBuffer(buffer, '.webp')
  } catch (e) {
    console.error('[Stability] generation error:', e)
    return null
  }
}

type ImageSize = { width: number; height: number; aspectRatio: '16:9' | '3:2' }

const IMAGE_SIZES: ImageSize[] = [
  { width: 1200, height: 630, aspectRatio: '16:9' }, // 封面
  { width: 800, height: 533, aspectRatio: '3:2' },   // 正文图 1
  { width: 800, height: 533, aspectRatio: '3:2' },   // 正文图 2
]

/**
 * 根据配置统一生成所有文章图片，全部下载保存到本地 /uploads/。
 * 索引 0 为封面，其余为正文内嵌图。
 * 未配置 API Key 时返回空数组，文章无图。
 */
async function generateArticleImages(keyword: string, count: number): Promise<string[]> {
  const { provider, apiKey } = await getImageGenSettings()

  if (!apiKey) {
    console.warn('[image] No image generation API key configured')
    return []
  }

  const sizes = IMAGE_SIZES.slice(0, count)
  const results: string[] = []

  for (const size of sizes) {
    let path: string | null = null

    if (provider === 'huggingface') {
      path = await generateHuggingFaceImage(keyword, apiKey, size.width, size.height)
    } else if (provider === 'openai') {
      path = await generateDalleImage(keyword, apiKey)
    } else if (provider === 'stability') {
      path = await generateStabilityImage(keyword, apiKey, size.aspectRatio)
    }

    if (path) results.push(path)
  }

  return results
}

/** 将图片 URL 数组按间隔插入 HTML 正文 */
function insertImagesIntoContent(html: string, imageUrls: string[], keyword: string): string {
  if (!html || imageUrls.length === 0) return html

  const insertUrls = imageUrls.slice(1) // 跳过封面图
  if (insertUrls.length === 0) return html

  let urlIndex = 0
  let paragraphCount = 0
  const insertAfterParagraphs = [2, 5, 8]

  return html.replace(/<\/p>/gi, (match) => {
    paragraphCount++
    if (insertAfterParagraphs.includes(paragraphCount) && urlIndex < insertUrls.length) {
      const url = insertUrls[urlIndex]
      urlIndex++
      const alt = escapeHtml(`${keyword} massage therapy`)
      return `${match}\n<figure class="article-image">\n  <img src="${url}" alt="${alt}" loading="lazy" />\n</figure>`
    }
    return match
  })
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ============================================================
// Prompt & 解析
// ============================================================

/** 构建 SEO 优化的文章生成 prompt */
function buildArticlePrompt(
  keyword: string,
  locale: string,
  services: { slug: string; name: string; summary: string | null }[],
  contact: { phone: string | null; email: string | null; address: string | null } | null,
): string {
  const loc = locale === 'en' ? 'en' : 'de'
  const serviceLinks = services
    .slice(0, 6)
    .map((s) => `- <a href="/${loc}/services/${s.slug}">${s.name}</a>: ${s.summary || ''}`)
    .join('\n')

  const bookingUrl = `/${loc}/booking`
  const phone = contact?.phone || ''
  const address = contact?.address || ''

  return `You are a senior health & wellness content strategist writing for China TCM Massage, a Traditional Chinese Medicine massage studio in Munich, Germany. The website serves German and English-speaking audiences.\n\nYour task: create a **high-quality, genuinely informative** bilingual blog article for the keyword "${keyword}".\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCONTENT QUALITY REQUIREMENTS (most important)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. **Provide real value**: Write as if educating a patient. Include specific, actionable health information — not generic filler. Reference TCM principles (qi, meridians, acupressure points) where relevant, but explain them accessibly.\n\n2. **Original perspective**: Don't just rewrite what every other massage website says. Add unique angles:\n   - Compare TCM approaches with Western physiotherapy perspectives\n   - Include practical self-care tips readers can try at home\n   - Mention specific conditions or symptoms and how TCM massage addresses them\n   - Reference scientific studies or TCM literature when applicable\n\n3. **Reader-first writing**:\n   - Use concrete examples and scenarios ("If you sit at a desk for 8 hours...")\n   - Address common misconceptions\n   - Provide clear, structured information with logical flow\n   - Each paragraph should advance the reader's understanding\n\n4. **Natural, fluent language**:\n   - German text must read as native German, NOT translated. Use natural collocations, German medical terminology (Verspannungen, Beschwerden, Wohlbefinden), and conversational-professional tone.\n   - English should be equally polished and natural.\n   - Avoid AI-sounding phrases like "In today's fast-paced world", "In conclusion", "It's important to note", "Furthermore".\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nARTICLE STRUCTURE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n- **Title**: Include the keyword naturally, max 60 characters. Make it compelling — not just keyword stuffing.\n- **Summary**: 2-3 sentences capturing the article's value proposition.\n- **Body**: 1000-1800 words per language. Use this structure:\n  - Opening paragraph: Hook the reader with a relatable scenario or surprising fact. Include the keyword naturally.\n  - 4-6 H2 sections, each with 2-4 paragraphs. Use descriptive H2 headings (not just the keyword repeated). Include H3 sub-sections where content warrants it.\n  - Closing section: Summarize key takeaways before the CTA.\n- **HTML**: Use only <h2>, <h3>, <p>, <ul>/<ol>/<li>, <strong>, <blockquote>, <a> tags. No <div> in body content except the CTA block at the end.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSEO REQUIREMENTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n- **Keyword placement**: In title, first paragraph, at least one H2, meta description, and naturally throughout (1-2% density).\n- **LSI keywords**: Include 5-8 semantically related terms naturally (e.g., for "Rückenmassage" include Wirbelsäule, Muskulatur, Verspannungen, Schmerzlinderung, etc.)\n- **Meta description**: Compelling, includes keyword, 120-155 characters. Write it like an ad — make people want to click.\n- **SEO title**: Include keyword + location/brand, max 60 chars.\n- **Internal links**: Naturally reference 2-3 of these service pages within the text where contextually relevant:\n${serviceLinks}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCTA BLOCK\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEnd EACH language version with this exact CTA HTML:\n\nGerman:\n<div class="article-cta">\n  <h3>Jetzt Termin vereinbaren</h3>\n  <p>Erleben Sie die wohltuende Wirkung einer professionellen TCM-Massage in München. Unsere erfahrenen Therapeuten beraten Sie gerne persönlich.</p>\n  <a href="${bookingUrl}" class="cta-button">Termin buchen</a>\n  ${phone ? `<p>📞 Tel: ${phone}</p>` : ''}\n  ${address ? `<p>📍 ${address}</p>` : ''}\n</div>\n\nEnglish:\n<div class="article-cta">\n  <h3>Book Your Appointment Now</h3>\n  <p>Experience the healing benefits of professional TCM massage in Munich. Our experienced therapists provide personalized consultations.</p>\n  <a href="${bookingUrl}" class="cta-button">Book Appointment</a>\n  ${phone ? `<p>📞 Tel: ${phone}</p>` : ''}\n  ${address ? `<p>📍 ${address}</p>` : ''}\n</div>\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nURL SLUG\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nGenerate from the German title: lowercase, hyphens, replace ä→ae, ö→oe, ü→ue, ß→ss. Max 60 chars.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOUTPUT FORMAT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nReturn ONLY valid JSON. No markdown fences. No text before or after the JSON object.\n\n{\n  "titleDe": "German title (max 60 chars, include keyword)",\n  "titleEn": "English title (max 60 chars)",\n  "summaryDe": "German summary 2-3 sentences",\n  "summaryEn": "English summary 2-3 sentences",\n  "contentDe": "Full German HTML — H2/H3 sections, paragraphs, internal links, CTA block at end",\n  "contentEn": "Full English HTML — same structure",\n  "seoTitleDe": "German SEO title | China TCM Massage München (max 60 chars)",\n  "seoTitleEn": "English SEO title | China TCM Massage Munich (max 60 chars)",\n  "seoDescriptionDe": "German meta description 120-155 chars, compelling, includes keyword",\n  "seoDescriptionEn": "English meta description 120-155 chars",\n  "seoKeywordsDe": "hauptkeyword, verwandtes-keyword-1, verwandtes-keyword-2, ...",\n  "seoKeywordsEn": "main-keyword, related-keyword-1, related-keyword-2, ...",\n  "suggestedTags": ["slug-1", "slug-2", "slug-3"],\n  "slug": "seo-friendly-slug-from-german-title"\n}`
}

/** 解析 AI 返回的 JSON 文章内容 */
function parseArticleResponse(raw: string): GeneratedArticle {
  let cleaned = raw.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  cleaned = cleaned.trim()

  try {
    const data = JSON.parse(cleaned)
    return {
      titleDe: String(data.titleDe || ''),
      titleEn: String(data.titleEn || ''),
      summaryDe: String(data.summaryDe || ''),
      summaryEn: String(data.summaryEn || ''),
      contentDe: String(data.contentDe || ''),
      contentEn: String(data.contentEn || ''),
      seoTitleDe: String(data.seoTitleDe || ''),
      seoTitleEn: String(data.seoTitleEn || ''),
      seoDescriptionDe: String(data.seoDescriptionDe || ''),
      seoDescriptionEn: String(data.seoDescriptionEn || ''),
      seoKeywordsDe: String(data.seoKeywordsDe || ''),
      seoKeywordsEn: String(data.seoKeywordsEn || ''),
      suggestedTags: Array.isArray(data.suggestedTags)
        ? data.suggestedTags.map((t: unknown) => String(t))
        : [],
      slug: String(data.slug || ''),
    }
  } catch {
    throw new Error(`Failed to parse AI response as JSON. Raw response starts with: ${raw.substring(0, 200)}`)
  }
}

/** 根据 suggestedTags slug 查找或创建 ArticleTag，返回 tagId 数组 */
async function resolveTagIds(slugs: string[]): Promise<number[]> {
  if (!slugs.length) return []

  const ids: number[] = []
  for (const rawSlug of slugs.slice(0, 5)) {
    const slug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50)
    if (!slug) continue

    let tag = await prisma.articleTag.findUnique({ where: { slug } })
    if (!tag) {
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      tag = await prisma.articleTag.create({
        data: { slug, nameDe: name, nameEn: name },
      })
    }
    ids.push(tag.id)
  }
  return ids
}
