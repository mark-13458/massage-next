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
  const nonce = headersList.get('x-nonce') ?? ''

  return (
    <html lang={lang}>
      <head>
        {nonce && (
          // Expose nonce for inline scripts (Next.js uses this automatically)
          <meta name="csp-nonce" content={nonce} />
        )}
      </head>
      <body>{children}</body>
    </html>
  )
}
