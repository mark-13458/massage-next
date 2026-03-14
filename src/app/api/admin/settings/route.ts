import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

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
    const value = {
      siteName: typeof json.siteName === 'string' ? json.siteName : 'China TCM Massage',
      adminEmail: typeof json.adminEmail === 'string' ? json.adminEmail : '',
      defaultFrontendLocale: json.defaultFrontendLocale === 'en' ? 'en' : 'de',
      adminDefaultLanguage: json.adminDefaultLanguage === 'en' ? 'en' : 'zh',
      timezone: typeof json.timezone === 'string' ? json.timezone : 'Europe/Berlin',
      currency: typeof json.currency === 'string' ? json.currency : 'EUR',
      bookingNoticeDe:
        typeof json.bookingNoticeDe === 'string'
          ? json.bookingNoticeDe
          : typeof json.bookingNoticeZh === 'string'
            ? json.bookingNoticeZh
            : '',
      bookingNoticeEn: typeof json.bookingNoticeEn === 'string' ? json.bookingNoticeEn : '',
      cfTurnstileEnabled: Boolean(json.cfTurnstileEnabled),
      cfTurnstileSiteKey: typeof json.cfTurnstileSiteKey === 'string' ? json.cfTurnstileSiteKey : '',
      cfTurnstileSecretKey: typeof json.cfTurnstileSecretKey === 'string' ? json.cfTurnstileSecretKey : '',
      bookingRateLimitWindowMin:
        typeof json.bookingRateLimitWindowMin === 'number' && Number.isFinite(json.bookingRateLimitWindowMin)
          ? Math.max(1, Math.min(1440, Math.floor(json.bookingRateLimitWindowMin)))
          : 15,
      bookingRateLimitMaxRequests:
        typeof json.bookingRateLimitMaxRequests === 'number' && Number.isFinite(json.bookingRateLimitMaxRequests)
          ? Math.max(1, Math.min(20, Math.floor(json.bookingRateLimitMaxRequests)))
          : 3,
    }

    await prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value },
      create: { key: SETTINGS_KEY, value },
    })

    return apiOk({ value })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}
