import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getMessages } from '../../lib/copy'
import { getSystemSettings } from '../../server/services/site.service'
import { MobileMenu } from './MobileMenu'

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const settings = await getSystemSettings().catch(() => null)
  const siteName = settings?.siteName || t.brand

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/gallery`, label: t.nav.gallery },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <img src="/logo.svg" alt={siteName} className="h-8 w-auto" />
          <span className="text-sm font-semibold tracking-wide text-brown-800 sm:text-base">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 text-sm text-brown-700 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
          <Link
            href={`/${locale}/booking`}
            className="rounded-full bg-brown-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-brown-700"
          >
            {t.nav.booking}
          </Link>
        </div>

        {/* Mobile menu */}
        <MobileMenu locale={locale} navLinks={navLinks} bookingLabel={t.nav.booking} />
      </nav>
    </header>
  )
}
