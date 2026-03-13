import { NextRequest, NextResponse } from 'next/server'
import { clearAdminSession } from '../../../../../src/lib/auth'
import { getSystemSettings } from '../../../../../src/server/services/site.service'

export async function POST(request: NextRequest) {
  await clearAdminSession()
  const settings = await getSystemSettings().catch(() => null)
  const locale = settings?.defaultFrontendLocale === 'en' ? 'en' : 'de'
  return NextResponse.redirect(new URL(`/${locale}`, request.url))
}
