import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getMessages } from '../../lib/copy'
import { getSystemSettings } from '../../server/services/site.service'

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const settings = await getSystemSettings().catch(() => null)
  const siteName = settings?.siteName || t.brand

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <img src="/logo.svg" alt={siteName} className="h-8 w-auto" />
          <span className="text-sm font-semibold tracking-wide text-brown-800 sm:text-base">{siteName}</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-brown-700 md:flex">
          <Link href={`/${locale}`}>{t.nav.home}</Link>
          <Link href={`/${locale}/services`}>{t.nav.services}</Link>
          <Link href={`/${locale}/about`}>{t.nav.about}</Link>
          <Link href={`/${locale}/gallery`}>{t.nav.gallery}</Link>
          <Link href={`/${locale}/contact`}>{t.nav.contact}</Link>
          <Link
            href={`/${locale}/booking`}
            className="rounded-full bg-brown-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-brown-700"
          >
            {t.nav.booking}
          </Link>
        </div>
      </nav>
    </header>
  )
}
