import type { Viewport } from 'next'
import { headers } from 'next/headers'
import { Lora, Raleway } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { defaultSiteMetadata } from '../lib/seo'

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
})

export const dynamic = 'force-dynamic'

export const metadata = defaultSiteMetadata

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f8f5f0',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const localeMatch = pathname.match(/^\/(de|en)(\/|$)/)
  const lang = localeMatch ? localeMatch[1] : 'de'

  return (
    <html lang={lang} className={`${lora.variable} ${raleway.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        {children}
        {/* Google tag (gtag.js) - Google Ads AW-17412666826
            lazyOnload：在 window load 之后再加载。该标签仅做 Ads 基础配置，
            站内没有任何代码调用 gtag()，因此延后不影响功能，但可把 142 KiB
            移出关键路径。 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17412666826"
          strategy="lazyOnload"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17412666826');
          `}
        </Script>
      </body>
    </html>
  )
}
