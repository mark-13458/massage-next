import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionValue, createSessionValue } from './src/lib/auth'

const COOKIE_NAME = 'massage_admin_session'
// 活跃会话滑动窗口：8 小时无操作则过期
const SESSION_MAX_AGE = 60 * 60 * 8

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const value = request.cookies.get(COOKIE_NAME)?.value
  const payload = verifySessionValue(value)

  if (!payload) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 刷新 cookie 有效期（滑动窗口）
  const response = NextResponse.next()
  response.cookies.set(COOKIE_NAME, createSessionValue(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
