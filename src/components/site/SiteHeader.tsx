import Image from 'next/image'
import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getMessages } from '../../lib/copy'
import { getSystemSettings } from '../../server/services/site.service'
import { MobileMenu } from './MobileMenu'
import { LangSwitcher } from './LangSwitcher'

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
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-cream/95 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Image
            src="/logo.svg"
            alt={siteName}
            width={32}
            height={32}
            className="h-7 w-auto flex-shrink-0 sm:h-8"
            priority
          />
          <span className="truncate text-sm font-semibold tracking-wide text-brown-800 sm:text-base">{siteName}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 text-sm text-brown-700 md:flex lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brown-900"
            >
              {link.label}
            </Link>
          ))}
          <LangSwitcher locale={locale} />
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
