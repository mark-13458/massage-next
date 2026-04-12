import { prisma } from '../../lib/prisma'
import { getAISettings, generateText } from './ai-provider.service'
import { getActiveServices } from './site.service'
import { getContactSettings } from './site.service'
import { findNextPendingKeyword } from '../repositories/admin/keyword-pool.repository'
import { CACHE_TAGS } from './site.service'
import { revalidateTag } from 'next/cache'

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

type PexelsPhoto = {
  src: { large: string; medium: string }
  alt: string
  photographer: string
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

  // 7. 搜索相关图片并插入正文
  const pexelsKey = await getPexelsApiKey()
  let coverImageUrl: string | null = null

  if (pexelsKey) {
    const photos = await searchPexelsPhotos(keyword.keyword, pexelsKey, 4)
    if (photos.length > 0) {
      // 第一张做封面
      coverImageUrl = photos[0].src.large

      // 把图片插入正文（每隔几段插一张）
      article.contentDe = insertImagesIntoContent(article.contentDe, photos, 'de')
      article.contentEn = insertImagesIntoContent(article.contentEn, photos, 'en')
    }
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
// Pexels 图片搜索
// ============================================================

/** 从 SiteSetting 读取 Pexels API Key */
async function getPexelsApiKey(): Promise<string | null> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'aiSettings' } })
    if (!setting?.value) return null
    const v = setting.value as Record<string, unknown>
    return typeof v.pexelsApiKey === 'string' && v.pexelsApiKey ? v.pexelsApiKey : null
  } catch {
    return null
  }
}

/** 搜索 Pexels 图片 */
async function searchPexelsPhotos(query: string, apiKey: string, count: number): Promise<PexelsPhoto[]> {
  try {
    // 用英文搜索词效果更好，加上 massage/TCM 上下文
    const searchQuery = `${query} massage wellness`
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`

    const res = await fetch(url, {
      headers: { Authorization: apiKey },
    })

    if (!res.ok) {
      console.error(`[Pexels] API error ${res.status}`)
      return []
    }

    const data = await res.json()
    return (data.photos || []).map((p: Record<string, unknown>) => ({
      src: {
        large: (p.src as Record<string, string>)?.large || '',
        medium: (p.src as Record<string, string>)?.medium || '',
      },
      alt: typeof p.alt === 'string' ? p.alt : '',
      photographer: typeof p.photographer === 'string' ? p.photographer : '',
    }))
  } catch (e) {
    console.error('[Pexels] search error:', e)
    return []
  }
}

/** 将图片按间隔插入 HTML 正文 */
function insertImagesIntoContent(html: string, photos: PexelsPhoto[], locale: string): string {
  if (!html || photos.length === 0) return html

  // 按 </h2> 或 </p> 拆分段落，找到合适的插入点
  // 策略：在第 2 个和第 4 个 </p> 后各插入一张图（跳过第 1 张封面图）
  const insertPhotos = photos.slice(1) // 跳过封面图
  if (insertPhotos.length === 0) return html

  let photoIndex = 0
  let paragraphCount = 0
  const insertAfterParagraphs = [2, 5, 8] // 在第 2、5、8 段后插图

  const result = html.replace(/<\/p>/gi, (match) => {
    paragraphCount++
    if (insertAfterParagraphs.includes(paragraphCount) && photoIndex < insertPhotos.length) {
      const photo = insertPhotos[photoIndex]
      photoIndex++
      const credit = locale === 'de' ? 'Foto von' : 'Photo by'
      return `${match}
<figure class="article-image">
  <img src="${photo.src.large}" alt="${escapeHtml(photo.alt || 'Massage Wellness')}" loading="lazy" />
  <figcaption>${credit} ${escapeHtml(photo.photographer)} / Pexels</figcaption>
</figure>`
    }
    return match
  })

  return result
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
  const serviceLinks = services
    .slice(0, 6)
    .map((s) => `- <a href="/${locale === 'en' ? 'en' : 'de'}/services/${s.slug}">${s.name}</a>: ${s.summary || ''}`)
    .join('\n')

  const bookingUrl = `/${locale === 'en' ? 'en' : 'de'}/booking`
  const phone = contact?.phone || ''
  const address = contact?.address || ''

  return `You are an expert SEO content writer for a Traditional Chinese Medicine (TCM) massage clinic in Munich, Germany.

Write a bilingual blog article (German and English) targeting the keyword: "${keyword}"

## Requirements

### Structure
- Title: Include the main keyword, under 60 characters
- Meta description: Include keyword, under 155 characters
- Body: 800-1500 words per language, well-structured with H2/H3 headings
- Keyword density: 1-2% for the target keyword
- Include a brief summary (2-3 sentences) for each language
- Write at least 6-8 paragraphs with clear H2 section headings

### Internal Links
Naturally embed these service page links within the article content where relevant:
${serviceLinks}

### CTA Section
End each language version with a CTA block using this exact HTML structure:

For German:
<div class="article-cta">
  <h3>Jetzt Termin vereinbaren</h3>
  <p>Erleben Sie die wohltuende Wirkung einer professionellen TCM-Massage. Unsere erfahrenen Therapeuten beraten Sie gerne.</p>
  <a href="${bookingUrl}" class="cta-button">Termin buchen</a>
  ${phone ? `<p>📞 Tel: ${phone}</p>` : ''}
  ${address ? `<p>📍 ${address}</p>` : ''}
</div>

For English:
<div class="article-cta">
  <h3>Book Your Appointment Now</h3>
  <p>Experience the healing benefits of professional TCM massage. Our experienced therapists are here to help you.</p>
  <a href="${bookingUrl}" class="cta-button">Book Appointment</a>
  ${phone ? `<p>📞 Tel: ${phone}</p>` : ''}
  ${address ? `<p>📍 ${address}</p>` : ''}
</div>

### SEO Best Practices
- Use the keyword in the first paragraph
- Include related LSI keywords naturally
- Use descriptive H2/H3 headings that include keyword variations
- Write in a professional but approachable tone
- German should be native-quality, not translated

### URL Slug
Generate a URL-friendly slug from the German title (lowercase, hyphens, no umlauts — use ae/oe/ue instead).

## Output Format
Return ONLY valid JSON (no markdown code fences, no extra text):
{
  "titleDe": "German title",
  "titleEn": "English title",
  "summaryDe": "German summary (2-3 sentences)",
  "summaryEn": "English summary (2-3 sentences)",
  "contentDe": "Full German HTML content with headings, paragraphs, links, and CTA",
  "contentEn": "Full English HTML content with headings, paragraphs, links, and CTA",
  "seoTitleDe": "German SEO title (max 60 chars)",
  "seoTitleEn": "English SEO title (max 60 chars)",
  "seoDescriptionDe": "German meta description (max 155 chars)",
  "seoDescriptionEn": "English meta description (max 155 chars)",
  "seoKeywordsDe": "keyword1, keyword2, keyword3",
  "seoKeywordsEn": "keyword1, keyword2, keyword3",
  "suggestedTags": ["tag-slug-1", "tag-slug-2", "tag-slug-3"],
  "slug": "url-friendly-slug"
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
