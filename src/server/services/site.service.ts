import { unstable_cache } from 'next/cache'
import { prisma } from '../../lib/prisma'
import { Locale } from '../../lib/i18n'

// 缓存 tag 常量，供管理员写操作时 revalidate 使用
export const CACHE_TAGS = {
  services: 'site-services',
  testimonials: 'site-testimonials',
  faqs: 'site-faqs',
  hours: 'site-hours',
  contact: 'site-contact',
  hero: 'site-hero',
  gallery: 'site-gallery',
  settings: 'site-settings',
  articles: 'site-articles',
} as const

export const getActiveServices = unstable_cache(
  async function getActiveServices(locale: Locale) {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { coverImage: { select: { filePath: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: locale === 'de' ? service.nameDe : service.nameEn,
      summary: locale === 'de' ? service.summaryDe : service.summaryEn,
      description: locale === 'de' ? service.descriptionDe : service.descriptionEn,
      durationMin: service.durationMin,
      price: service.price,
      isFeatured: service.isFeatured,
      coverImageFilePath: service.coverImage?.filePath ?? null,
    }))
  },
  ['site-services'],
  { revalidate: 300, tags: [CACHE_TAGS.services] }
)

export const getPublishedTestimonials = unstable_cache(
  async function getPublishedTestimonials(locale: Locale) {
    return prisma.testimonial.findMany({
      where: { isPublished: true, locale },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 3,
    })
  },
  ['site-testimonials'],
  { revalidate: 300, tags: [CACHE_TAGS.testimonials] }
)

export const getActiveFaqs = unstable_cache(
  async function getActiveFaqs(locale: Locale) {
    const items = await prisma.faqItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    return items.map((item) => ({
      id: item.id,
      question: locale === 'de' ? item.questionDe : item.questionEn,
      answer: locale === 'de' ? item.answerDe : item.answerEn,
    }))
  },
  ['site-faqs'],
  { revalidate: 300, tags: [CACHE_TAGS.faqs] }
)

export const getBusinessHours = unstable_cache(
  async function getBusinessHours(locale: Locale) {
    const items = await prisma.businessHour.findMany({
      orderBy: [{ weekday: 'asc' }],
    })

    return items.map((item) => ({
      weekday: item.weekday,
      label: locale === 'de' ? item.dayLabelDe : item.dayLabelEn,
      openTime: item.openTime,
      closeTime: item.closeTime,
      isClosed: item.isClosed,
    }))
  },
  ['site-hours'],
  { revalidate: 300, tags: [CACHE_TAGS.hours] }
)

export const getContactSettings = unstable_cache(
  async function getContactSettings() {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'contact' },
    })

    const value = setting?.value

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null
    }

    const record = value as Record<string, unknown>

    return {
      phone: typeof record.phone === 'string' ? record.phone : null,
      email: typeof record.email === 'string' ? record.email : null,
      address: typeof record.address === 'string' ? record.address : null,
    }
  },
  ['site-contact'],
  { revalidate: 300, tags: [CACHE_TAGS.contact] }
)

export const getHeroSettings = unstable_cache(
  async function getHeroSettings(locale: Locale) {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'hero' },
    })

    const value = setting?.value

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null
    }

    const record = value as Record<string, unknown>

    return {
      eyebrow: locale === 'de' ? record.eyebrowDe : record.eyebrowEn,
      title: locale === 'de' ? record.titleDe : record.titleEn,
      subtitle: locale === 'de' ? record.subtitleDe : record.subtitleEn,
      note: locale === 'de' ? record.noteDe : record.noteEn,
      imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : null,
    }
  },
  ['site-hero'],
  { revalidate: 300, tags: [CACHE_TAGS.hero] }
)

export const getActiveGallery = unstable_cache(
  async function getActiveGallery(locale: Locale) {
    const items = await prisma.galleryImage.findMany({
      where: { isActive: true, file: { isPublic: true } },
      include: { file: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      take: 24,
    })

    return items.map((item) => ({
      id: item.id,
      title: locale === 'de' ? item.titleDe : item.titleEn,
      alt: locale === 'de' ? item.altDe : item.altEn,
      imageUrl: item.file.filePath,
      isCover: item.isCover,
    }))
  },
  ['site-gallery'],
  { revalidate: 300, tags: [CACHE_TAGS.gallery] }
)

export const getPublishedArticles = unstable_cache(
  async function getPublishedArticles(locale: Locale) {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      include: {
        coverImage: { select: { filePath: true } },
        tags: { include: { tag: true } },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    })

    return articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: locale === 'de' ? a.titleDe : a.titleEn,
      summary: locale === 'de' ? a.summaryDe : a.summaryEn,
      coverImageUrl: a.coverImageUrl || a.coverImage?.filePath || null,
      publishedAt: a.publishedAt?.toISOString() || null,
      tags: a.tags.map((t) => ({
        slug: t.tag.slug,
        name: locale === 'de' ? t.tag.nameDe : t.tag.nameEn,
      })),
    }))
  },
  ['site-articles'],
  { revalidate: 300, tags: [CACHE_TAGS.articles] }
)

export const getArticleBySlug = unstable_cache(
  async function getArticleBySlug(slug: string, locale: Locale) {
    const a = await prisma.article.findUnique({
      where: { slug, isPublished: true },
      include: {
        coverImage: { select: { filePath: true } },
        tags: { include: { tag: true } },
      },
    })
    if (!a) return null

    return {
      id: a.id,
      slug: a.slug,
      titleDe: a.titleDe,
      titleEn: a.titleEn,
      title: locale === 'de' ? a.titleDe : a.titleEn,
      summary: locale === 'de' ? a.summaryDe : a.summaryEn,
      content: locale === 'de' ? a.contentDe : a.contentEn,
      seoTitle: locale === 'de' ? a.seoTitleDe : a.seoTitleEn,
      seoDescription: locale === 'de' ? a.seoDescriptionDe : a.seoDescriptionEn,
      seoKeywords: locale === 'de' ? a.seoKeywordsDe : a.seoKeywordsEn,
      coverImageUrl: a.coverImageUrl || a.coverImage?.filePath || null,
      publishedAt: a.publishedAt?.toISOString() || null,
      updatedAt: a.updatedAt.toISOString(),
      tags: a.tags.map((t) => ({
        slug: t.tag.slug,
        name: locale === 'de' ? t.tag.nameDe : t.tag.nameEn,
      })),
    }
  },
  ['site-article-detail'],
  { revalidate: 300, tags: [CACHE_TAGS.articles] }
)

export const getArticleTags = unstable_cache(
  async function getArticleTags(locale: Locale) {
    const tags = await prisma.articleTag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { articles: { _count: 'desc' } },
    })
    return tags
      .filter((t) => t._count.articles > 0)
      .map((t) => ({
        slug: t.slug,
        name: locale === 'de' ? t.nameDe : t.nameEn,
        count: t._count.articles,
      }))
  },
  ['site-article-tags'],
  { revalidate: 300, tags: [CACHE_TAGS.articles] }
)

export const getSystemSettings = unstable_cache(
  async function getSystemSettings() {
  if (!process.env.DATABASE_URL) {
    return null
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'adminSystemSettings' },
  })

  const value = setting?.value
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  return {
    siteName: typeof record.siteName === 'string' ? record.siteName : 'China TCM Massage',
    adminEmail: typeof record.adminEmail === 'string' ? record.adminEmail : '',
    defaultFrontendLocale: record.defaultFrontendLocale === 'en' ? 'en' : 'de',
    adminDefaultLanguage: record.adminDefaultLanguage === 'en' ? 'en' : 'zh',
    timezone: typeof record.timezone === 'string' ? record.timezone : 'Europe/Berlin',
    currency: typeof record.currency === 'string' ? record.currency : 'EUR',
    bookingNoticeDe:
      typeof record.bookingNoticeDe === 'string'
        ? record.bookingNoticeDe
        : typeof record.bookingNoticeZh === 'string'
          ? record.bookingNoticeZh
          : '',
    bookingNoticeEn: typeof record.bookingNoticeEn === 'string' ? record.bookingNoticeEn : '',
    cfTurnstileEnabled: Boolean(record.cfTurnstileEnabled),
    cfTurnstileSiteKey: typeof record.cfTurnstileSiteKey === 'string' ? record.cfTurnstileSiteKey : '',
    cfTurnstileSecretKey: typeof record.cfTurnstileSecretKey === 'string' ? record.cfTurnstileSecretKey : '',
    bookingRateLimitWindowMin:
      typeof record.bookingRateLimitWindowMin === 'number' && Number.isFinite(record.bookingRateLimitWindowMin)
        ? record.bookingRateLimitWindowMin
        : 15,
    bookingRateLimitMaxRequests:
      typeof record.bookingRateLimitMaxRequests === 'number' && Number.isFinite(record.bookingRateLimitMaxRequests)
        ? record.bookingRateLimitMaxRequests
        : 3,
    privacyConsentRequired: record.privacyConsentRequired !== false,
    bookingRetentionDays:
      typeof record.bookingRetentionDays === 'number' && Number.isFinite(record.bookingRetentionDays)
        ? record.bookingRetentionDays
        : 180,
    allowDeletionRequests: Boolean(record.allowDeletionRequests),
    featureEnableBookingManage: record.featureEnableBookingManage !== false,
    featureEnableEmailReminders: record.featureEnableEmailReminders !== false,
    featureEnableWhatsappReminders: Boolean(record.featureEnableWhatsappReminders),
    seoTitleTemplateDe: typeof record.seoTitleTemplateDe === 'string' ? record.seoTitleTemplateDe : '',
    seoTitleTemplateEn: typeof record.seoTitleTemplateEn === 'string' ? record.seoTitleTemplateEn : '',
    seoMetaDescriptionDe: typeof record.seoMetaDescriptionDe === 'string' ? record.seoMetaDescriptionDe : '',
    seoMetaDescriptionEn: typeof record.seoMetaDescriptionEn === 'string' ? record.seoMetaDescriptionEn : '',
    frontendTheme: record.frontendTheme === 'zen' ? 'zen' : 'classic',
    logoFileId: typeof record.logoFileId === 'number' && Number.isFinite(record.logoFileId) ? record.logoFileId : null,
    faviconFileId:
      typeof record.faviconFileId === 'number' && Number.isFinite(record.faviconFileId) ? record.faviconFileId : null,
  } as const
},
  ['site-settings'],
  { revalidate: 300, tags: [CACHE_TAGS.settings] }
)
