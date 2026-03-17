import type { Viewport } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { defaultSiteMetadata } from '../lib/seo'

export const metadata = defaultSiteMetadata

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f8f5f0',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 从请求路径中提取 locale（/de/... 或 /en/...）
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-forwarded-uri') ?? ''
  const localeMatch = pathname.match(/^\/(de|en)(\/|$)/)
  const lang = localeMatch ? localeMatch[1] : 'de'

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
