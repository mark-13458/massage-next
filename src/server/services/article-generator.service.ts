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

type ImageGenProvider = 'pollinations' | 'openai' | 'stability'

type ImageGenSettings = {
  provider: ImageGenProvider
  apiKey: string
}

/**
 * 主入口：从关键词池取词 → AI 生成 → 搜索配图 → 存库 → 发布
 * 返回生成的文章 ID，无关键词时返回 null
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

  // 7. AI 生成图片并插入正文
  const imageUrls = await generateArticleImages(keyword.keyword, 3)
  const coverImageUrl: string | null = imageUrls[0] || null

  if (imageUrls.length > 1) {
    article.contentDe = insertImagesIntoContent(article.contentDe, imageUrls, keyword.keyword)
    article.contentEn = insertImagesIntoContent(article.contentEn, imageUrls, keyword.keyword)
  }

  // 8. 查找或创建标签
  const tagIds = await resolveTagIds(article.suggestedTags)

  // 9. 保存文章
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
      coverImageUrl,
      isPublished: true,
      publishedAt: new Date(),
      source: 'AI_GENERATED',
      keywordId: keyword.id,
      tags: tagIds.length > 0
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
  })

  // 10. 更新关键词状态为 USED
  await prisma.keywordPool.update({
    where: { id: keyword.id },
    data: { status: 'USED', usedAt: new Date() },
  })

  // 11. 清除缓存
  revalidateTag(CACHE_TAGS.articles)

  return { articleId: created.id, keyword: keyword.keyword }
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
      provider: (typeof v?.imageGenProvider === 'string' ? v.imageGenProvider : 'pollinations') as ImageGenProvider,
      apiKey: typeof v?.imageGenApiKey === 'string' ? v.imageGenApiKey : '',
    }
  } catch {
    return { provider: 'pollinations', apiKey: '' }
  }
}

/** 根据关键词生成一致的 seed 值 */
function keywordToSeed(keyword: string): number {
  let h = 0
  for (const c of keyword) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0
  return (Math.abs(h) % 9000) + 1000
}

/** 构建图片生成 prompt */
function buildImagePrompt(keyword: string): string {
  return `professional TCM massage therapy ${keyword} wellness spa relaxing warm lighting traditional chinese medicine treatment room`
}

/** Pollinations.ai — 纯 URL 构造，无需 API Key，无网络请求 */
function generatePollinationsUrls(keyword: string, count: number): string[] {
  const seed = keywordToSeed(keyword)
  const prompt = encodeURIComponent(buildImagePrompt(keyword))
  return Array.from({ length: count }, (_, i) => {
    const width = i === 0 ? 1200 : 800
    const height = i === 0 ? 630 : 533
    return `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&seed=${seed + i}&nologo=true&model=flux`
  })
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

/** DALL-E 3 — 生成图片并保存到本地 */
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

    // 下载图片并保存到本地（DALL-E URL 有时效限制）
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    return saveImageBuffer(buffer, '.webp')
  } catch (e) {
    console.error('[DALL-E] generation error:', e)
    return null
  }
}

/** Stability AI (stable-image-core) — 生成图片并保存到本地 */
async function generateStabilityImage(keyword: string, apiKey: string): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('prompt', buildImagePrompt(keyword))
    formData.append('output_format', 'webp')
    formData.append('aspect_ratio', '16:9')

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
    return saveImageBuffer(buffer, '.webp')
  } catch (e) {
    console.error('[Stability] generation error:', e)
    return null
  }
}

/**
 * 根据配置生成文章图片 URL 数组。
 * 索引 0 为封面图，其余为正文内嵌图。
 * DALL-E / Stability 仅生成封面，内嵌图统一用免费的 Pollinations。
 */
async function generateArticleImages(keyword: string, count: number): Promise<string[]> {
  const settings = await getImageGenSettings()

  if (settings.provider === 'openai' && settings.apiKey) {
    const coverPath = await generateDalleImage(keyword, settings.apiKey)
    if (coverPath) {
      const inlineUrls = generatePollinationsUrls(keyword, count).slice(1)
      return [coverPath, ...inlineUrls]
    }
  }

  if (settings.provider === 'stability' && settings.apiKey) {
    const coverPath = await generateStabilityImage(keyword, settings.apiKey)
    if (coverPath) {
      const inlineUrls = generatePollinationsUrls(keyword, count).slice(1)
      return [coverPath, ...inlineUrls]
    }
  }

  // 默认：Pollinations.ai（免费，无需 API Key）
  return generatePollinationsUrls(keyword, count)
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
      return `${match}
<figure class="article-image">
  <img src="${url}" alt="${alt}" loading="lazy" />
</figure>`
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

  return `You are a senior health & wellness content strategist writing for China TCM Massage, a Traditional Chinese Medicine massage studio in Munich, Germany. The website serves German and English-speaking audiences.

Your task: create a **high-quality, genuinely informative** bilingual blog article for the keyword "${keyword}".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT QUALITY REQUIREMENTS (most important)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **Provide real value**: Write as if educating a patient. Include specific, actionable health information — not generic filler. Reference TCM principles (qi, meridians, acupressure points) where relevant, but explain them accessibly.

2. **Original perspective**: Don't just rewrite what every other massage website says. Add unique angles:
   - Compare TCM approaches with Western physiotherapy perspectives
   - Include practical self-care tips readers can try at home
   - Mention specific conditions or symptoms and how TCM massage addresses them
   - Reference scientific studies or TCM literature when applicable

3. **Reader-first writing**:
   - Use concrete examples and scenarios ("If you sit at a desk for 8 hours...")
   - Address common misconceptions
   - Provide clear, structured information with logical flow
   - Each paragraph should advance the reader's understanding

4. **Natural, fluent language**:
   - German text must read as native German, NOT translated. Use natural collocations, German medical terminology (Verspannungen, Beschwerden, Wohlbefinden), and conversational-professional tone.
   - English should be equally polished and natural.
   - Avoid AI-sounding phrases like "In today's fast-paced world", "In conclusion", "It's important to note", "Furthermore".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARTICLE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **Title**: Include the keyword naturally, max 60 characters. Make it compelling — not just keyword stuffing.
- **Summary**: 2-3 sentences capturing the article's value proposition.
- **Body**: 1000-1800 words per language. Use this structure:
  - Opening paragraph: Hook the reader with a relatable scenario or surprising fact. Include the keyword naturally.
  - 4-6 H2 sections, each with 2-4 paragraphs. Use descriptive H2 headings (not just the keyword repeated). Include H3 sub-sections where content warrants it.
  - Closing section: Summarize key takeaways before the CTA.
- **HTML**: Use only <h2>, <h3>, <p>, <ul>/<ol>/<li>, <strong>, <blockquote>, <a> tags. No <div> in body content except the CTA block at the end.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEO REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **Keyword placement**: In title, first paragraph, at least one H2, meta description, and naturally throughout (1-2% density).
- **LSI keywords**: Include 5-8 semantically related terms naturally (e.g., for "Rückenmassage" include Wirbelsäule, Muskulatur, Verspannungen, Schmerzlinderung, etc.)
- **Meta description**: Compelling, includes keyword, 120-155 characters. Write it like an ad — make people want to click.
- **SEO title**: Include keyword + location/brand, max 60 chars.
- **Internal links**: Naturally reference 2-3 of these service pages within the text where contextually relevant:
${serviceLinks}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA BLOCK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

End EACH language version with this exact CTA HTML:

German:
<div class="article-cta">
  <h3>Jetzt Termin vereinbaren</h3>
  <p>Erleben Sie die wohltuende Wirkung einer professionellen TCM-Massage in München. Unsere erfahrenen Therapeuten beraten Sie gerne persönlich.</p>
  <a href="${bookingUrl}" class="cta-button">Termin buchen</a>
  ${phone ? `<p>📞 Tel: ${phone}</p>` : ''}
  ${address ? `<p>📍 ${address}</p>` : ''}
</div>

English:
<div class="article-cta">
  <h3>Book Your Appointment Now</h3>
  <p>Experience the healing benefits of professional TCM massage in Munich. Our experienced therapists provide personalized consultations.</p>
  <a href="${bookingUrl}" class="cta-button">Book Appointment</a>
  ${phone ? `<p>📞 Tel: ${phone}</p>` : ''}
  ${address ? `<p>📍 ${address}</p>` : ''}
</div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL SLUG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate from the German title: lowercase, hyphens, replace ä→ae, ö→oe, ü→ue, ß→ss. Max 60 chars.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON. No markdown fences. No text before or after the JSON object.

{
  "titleDe": "German title (max 60 chars, include keyword)",
  "titleEn": "English title (max 60 chars)",
  "summaryDe": "German summary 2-3 sentences",
  "summaryEn": "English summary 2-3 sentences",
  "contentDe": "Full German HTML — H2/H3 sections, paragraphs, internal links, CTA block at end",
  "contentEn": "Full English HTML — same structure",
  "seoTitleDe": "German SEO title | China TCM Massage München (max 60 chars)",
  "seoTitleEn": "English SEO title | China TCM Massage Munich (max 60 chars)",
  "seoDescriptionDe": "German meta description 120-155 chars, compelling, includes keyword",
  "seoDescriptionEn": "English meta description 120-155 chars",
  "seoKeywordsDe": "hauptkeyword, verwandtes-keyword-1, verwandtes-keyword-2, ...",
  "seoKeywordsEn": "main-keyword, related-keyword-1, related-keyword-2, ...",
  "suggestedTags": ["slug-1", "slug-2", "slug-3"],
  "slug": "seo-friendly-slug-from-german-title"
}`
}

/** 解析 AI 返回的 JSON 文章内容 */
function parseArticleResponse(raw: string): GeneratedArticle {
  // 尝试去除可能的 markdown 代码块包裹
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

    // 查找已有标签
    let tag = await prisma.articleTag.findUnique({ where: { slug } })
    if (!tag) {
      // 用 slug 自动生成标签名（首字母大写，连字符变空格）
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      tag = await prisma.articleTag.create({
        data: { slug, nameDe: name, nameEn: name },
      })
    }
    ids.push(tag.id)
  }
  return ids
}
