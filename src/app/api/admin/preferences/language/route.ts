import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_LANG_COOKIE, isAdminLang } from '../../../../../lib/admin-i18n'

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const lang = typeof json.lang === 'string' && isAdminLang(json.lang) ? json.lang : 'zh'
    const response = NextResponse.json({ status: 'ok', lang })
    response.cookies.set(ADMIN_LANG_COOKIE, lang, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  } catch {
    return NextResponse.json({ status: 'error', error: 'Invalid payload' }, { status: 400 })
  }
}
