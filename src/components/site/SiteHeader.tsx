import Image from 'next/image'
import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getMessages } from '../../lib/copy'
import { getSystemSettings } from '../../server/services/site.service'
import { prisma } from '../../lib/prisma'
import { MobileMenu } from './MobileMenu'
import { LangSwitcher } from './LangSwitcher'

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const settings = await getSystemSettings().catch(() => null)
  const siteName = settings?.siteName || t.brand

  let logoSrc = '/logo.svg'
  if (settings?.logoFileId) {
    const logoFile = await prisma.file.findUnique({
      where: { id: settings.logoFileId },
      select: { filePath: true },
    }).catch(() => null)
    if (logoFile?.filePath) {
      logoSrc = logoFile.filePath
    }
  }

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/gallery`, label: t.nav.gallery },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/60 bg-warm-50/95 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="group flex min-w-0 items-center gap-2.5 sm:gap-3 cursor-pointer"
        >
          <Image
            src={logoSrc}
            alt={siteName}
            width={32}
            height={32}
            className="h-7 w-auto flex-shrink-0 transition-opacity duration-200 group-hover:opacity-75 sm:h-8"
            priority
            unoptimized={logoSrc !== '/logo.svg'}
          />
          <span className="truncate font-serif text-sm font-semibold tracking-wide text-brown-800 transition-colors duration-200 group-hover:text-brown-600 sm:text-base">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 text-sm text-brown-700 md:flex lg:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 font-sans font-medium transition-all duration-150 hover:bg-brown-50 hover:text-brown-900 cursor-pointer lg:px-3.5"
            >
              {link.label}
            </Link>
          ))}
          <div className="mx-2 h-4 w-px bg-stone-300" />
          <LangSwitcher locale={locale} />
          <Link
            href={`/${locale}/booking`}
            className="ml-1.5 rounded-full bg-brown-900 px-4 py-2 font-sans text-sm font-semibold text-white
                       transition-all duration-200 hover:-translate-y-0.5 hover:bg-brown-800 hover:shadow-md
                       active:translate-y-0 cursor-pointer"
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
