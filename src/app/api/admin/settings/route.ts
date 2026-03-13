import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

const SETTINGS_KEY = 'adminSystemSettings'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
  }

  const setting = await prisma.siteSetting.findUnique({ where: { key: SETTINGS_KEY } })
  return NextResponse.json({ status: 'ok', value: setting?.value ?? null })
}

export async function PATCH(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
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
    }

    await prisma.siteSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value },
      create: { key: SETTINGS_KEY, value },
    })

    return NextResponse.json({ status: 'ok', value })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
