import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionValue } from './src/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const value = request.cookies.get('massage_admin_session')?.value
  const valid = verifySessionValue(value)

  if (!valid) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
