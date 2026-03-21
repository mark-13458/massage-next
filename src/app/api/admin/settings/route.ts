import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { CACHE_TAGS } from '../../../../server/services/site.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SETTINGS_KEY = 'adminSystemSettings'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  const setting = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } })
  return apiOk({ value: setting?.value ?? null })
}

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

    // Read existing value first, then merge — prevents partial updates from wiping other fields
    const existing = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } })
    const prev = (existing?.value && typeof existing.value === 'object' && !Array.isArray(existing.value)
      ? existing.value
      : {}) as Record<string, unknown>

    const merged: Record<string, unknown> = { ...prev }

    if (typeof json.siteName === 'string') merged.siteName = json.siteName
    if (typeof json.adminEmail === 'string') merged.adminEmail = json.adminEmail
    if (json.defaultFrontendLocale === 'en' || json.defaultFrontendLocale === 'de') merged.defaultFrontendLocale = json.defaultFrontendLocale
    if (json.adminDefaultLanguage === 'en' || json.adminDefaultLanguage === 'zh') merged.adminDefaultLanguage = json.adminDefaultLanguage
    if (typeof json.timezone === 'string') merged.timezone = json.timezone
    if (typeof json.currency === 'string') merged.currency = json.currency
    if (typeof json.bookingNoticeDe === 'string') merged.bookingNoticeDe = json.bookingNoticeDe
    if (typeof json.bookingNoticeEn === 'string') merged.bookingNoticeEn = json.bookingNoticeEn
    if ('cfTurnstileEnabled' in json) merged.cfTurnstileEnabled = Boolean(json.cfTurnstileEnabled)
    if (typeof json.cfTurnstileSiteKey === 'string') merged.cfTurnstileSiteKey = json.cfTurnstileSiteKey
    if (typeof json.cfTurnstileSecretKey === 'string') merged.cfTurnstileSecretKey = json.cfTurnstileSecretKey
    if (typeof json.bookingRateLimitWindowMin === 'number' && Number.isFinite(json.bookingRateLimitWindowMin))
      merged.bookingRateLimitWindowMin = Math.max(1, Math.min(1440, Math.floor(json.bookingRateLimitWindowMin)))
    if (typeof json.bookingRateLimitMaxRequests === 'number' && Number.isFinite(json.bookingRateLimitMaxRequests))
      merged.bookingRateLimitMaxRequests = Math.max(1, Math.min(20, Math.floor(json.bookingRateLimitMaxRequests)))
    if (typeof json.seoTitleTemplateDe === 'string') merged.seoTitleTemplateDe = json.seoTitleTemplateDe
    if (typeof json.seoTitleTemplateEn === 'string') merged.seoTitleTemplateEn = json.seoTitleTemplateEn
    if (typeof json.seoMetaDescriptionDe === 'string') merged.seoMetaDescriptionDe = json.seoMetaDescriptionDe
    if (typeof json.seoMetaDescriptionEn === 'string') merged.seoMetaDescriptionEn = json.seoMetaDescriptionEn
    if ('featureEnableEmailReminders' in json) merged.featureEnableEmailReminders = json.featureEnableEmailReminders !== false
    if ('featureEnableBookingManage' in json) merged.featureEnableBookingManage = json.featureEnableBookingManage !== false
    if ('featureEnableWhatsappReminders' in json) merged.featureEnableWhatsappReminders = Boolean(json.featureEnableWhatsappReminders)
    if ('privacyConsentRequired' in json) merged.privacyConsentRequired = json.privacyConsentRequired !== false
    if (typeof json.bookingRetentionDays === 'number' && Number.isFinite(json.bookingRetentionDays))
      merged.bookingRetentionDays = Math.max(1, Math.min(3650, Math.floor(json.bookingRetentionDays)))
    if ('allowDeletionRequests' in json) merged.allowDeletionRequests = Boolean(json.allowDeletionRequests)
    if (json.frontendTheme === 'zen' || json.frontendTheme === 'classic') merged.frontendTheme = json.frontendTheme
    if ('logoFileId' in json) merged.logoFileId = json.logoFileId === null ? null : (typeof json.logoFileId === 'number' && Number.isFinite(json.logoFileId) ? json.logoFileId : prev.logoFileId ?? null)
    if ('faviconFileId' in json) merged.faviconFileId = json.faviconFileId === null ? null : (typeof json.faviconFileId === 'number' && Number.isFinite(json.faviconFileId) ? json.faviconFileId : prev.faviconFileId ?? null)
    if (typeof json.smtpHost === 'string') merged.smtpHost = json.smtpHost
    if (typeof json.smtpPort === 'number' && Number.isFinite(json.smtpPort)) merged.smtpPort = Math.max(1, Math.min(65535, Math.floor(json.smtpPort)))
    if ('smtpSecure' in json) merged.smtpSecure = Boolean(json.smtpSecure)
    if (typeof json.smtpUser === 'string') merged.smtpUser = json.smtpUser
    if (typeof json.smtpPass === 'string') merged.smtpPass = json.smtpPass
    if (typeof json.smtpFrom === 'string') merged.smtpFrom = json.smtpFrom

    await prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: { value: merged as any },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { key: SETTINGS_KEY, value: merged as any },
    })

    revalidateTag(CACHE_TAGS.settings)

    return apiOk({ value: merged })
  } catch (error) {
    console.error('[admin/settings] unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
