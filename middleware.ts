import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'massage_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 8

/**
 * 可进行 CDN 边缘缓存的公开内容页。
 *
 * 这些页面内容全站一致，不含任何用户相关数据，也不会写 Cookie，
 * 因此可以安全地在 Cloudflare 缓存并直接回给所有访客。
 *
 * 采用白名单而非黑名单：未显式列出的路径一律不缓存。以下路由含个人
 * 数据或需要鉴权，必须始终回源，绝不可加入此列表：
 *   /[locale]/booking/manage/[token]   客户的预约详情
 *   /appointment/cancel|reschedule/... 取消 / 改期链接（带令牌）
 *   /admin/**                          后台
 *   /api/**                            接口
 * 预约表单页 /[locale]/booking 同样排除在外（含人机验证与表单令牌）。
 */
const CACHEABLE_PATHS: RegExp[] = [
  /^\/(de|en)$/,                                              // 首页
  /^\/(de|en)\/(about|contact|gallery|impressum|privacy)$/,    // 静态内容页
  /^\/(de|en)\/services$/,                                    // 服务列表
  /^\/(de|en)\/services\/[^/]+$/,                             // 服务详情
  /^\/(de|en)\/blog$/,                                        // 博客列表
  /^\/(de|en)\/blog\/[^/]+$/,                                 // 文章详情
  /^\/(de|en)\/blog\/tag\/[^/]+$/,                            // 标签归档
]

/** 内容由后台编辑，与数据层 unstable_cache 保持一致的 300 秒窗口 */
const EDGE_CACHE_CONTROL = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'

// Edge-compatible: Web Crypto API
async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function sign(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || 'dev-session-secret'
  const key = await getHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return bufToHex(sig)
}

async function verifySessionValue(value: string | undefined): Promise<string | null> {
  if (!value) return null
  const lastDot = value.lastIndexOf('.')
  if (lastDot <= 0) return null

  const payload = value.slice(0, lastDot)
  const signature = value.slice(lastDot + 1)
  const expected = await sign(payload)

  // Constant-time comparison
  if (signature.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < signature.length; i++) {
    diff |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0 ? payload : null
}

async function createSessionValue(payload: string): Promise<string> {
  return `${payload}.${await sign(payload)}`
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.pexels.com https://*.pexels.com https://www.googletagmanager.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com https://*.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com https://stats.g.doubleclick.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

  if (!pathname.startsWith('/admin')) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)

    // 仅对白名单内的公开内容页开放边缘缓存；其余保持默认的不缓存行为。
    // 限定 GET/HEAD，避免表单提交等写操作被缓存。
    if (
      (request.method === 'GET' || request.method === 'HEAD') &&
      CACHEABLE_PATHS.some((re) => re.test(pathname))
    ) {
      res.headers.set('Cache-Control', EDGE_CACHE_CONTROL)
    }

    return res
  }

  if (pathname === '/admin/login') {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  const value = request.cookies.get(COOKIE_NAME)?.value
  const payload = await verifySessionValue(value)

  if (!payload) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  response.cookies.set(COOKIE_NAME, await createSessionValue(payload), {
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
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
}
