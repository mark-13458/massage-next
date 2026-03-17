import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { verifySessionValue, createSessionValue } from './src/lib/auth'

const COOKIE_NAME = 'massage_admin_session'
// 活跃会话滑动窗口：8 小时无操作则过期
const SESSION_MAX_AGE = 60 * 60 * 8

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 生成 CSP nonce（每次请求唯一）
  const nonce = randomBytes(16).toString('base64')

  // CSP with nonce — replaces unsafe-inline for scripts
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.pexels.com https://*.pexels.com",
    "font-src 'self'",
    "frame-src https://www.google.com https://challenges.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  // 所有请求都注入 x-pathname 和 x-nonce，供根 layout 读取
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  requestHeaders.set('x-nonce', nonce)

  if (!pathname.startsWith('/admin')) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  if (pathname === '/admin/login') {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  const value = request.cookies.get(COOKIE_NAME)?.value
  const payload = verifySessionValue(value)

  if (!payload) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 刷新 cookie 有效期（滑动窗口）
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
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
  matcher: [
    // 匹配所有路径，排除静态资源和 Next.js 内部路径
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
}
