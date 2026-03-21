import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'massage_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 8

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
    `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.pexels.com https://*.pexels.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
    "connect-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)

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
