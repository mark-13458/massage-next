import { prisma } from '../../lib/prisma'
import { Locale } from '../../lib/i18n'

export async function getActiveServices(locale: Locale) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
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
  }))
}

export async function getPublishedTestimonials(locale: Locale) {
  return prisma.testimonial.findMany({
    where: { isPublished: true, locale },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 3,
  })
}

export async function getActiveFaqs(locale: Locale) {
  const items = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  return items.map((item) => ({
    id: item.id,
    question: locale === 'de' ? item.questionDe : item.questionEn,
    answer: locale === 'de' ? item.answerDe : item.answerEn,
  }))
}

export async function getBusinessHours(locale: Locale) {
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
}

export async function getContactSettings() {
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
}

export async function getHeroSettings(locale: Locale) {
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
}

export async function getActiveGallery(locale: Locale) {
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
}

export async function getSystemSettings() {
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
  }
}
