'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Locale } from '../../lib/i18n'

export function LangSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname()

  // Swap /de ↔ /en at the start of the path (precise match to avoid replacing locale in slugs)
  const otherLocale: Locale = locale === 'de' ? 'en' : 'de'
  const otherPath = pathname.replace(new RegExp(`^/${locale}(/|$)`), `/${otherLocale}$1`)

  return (
    <Link
      href={otherPath}
      className="flex h-8 items-center rounded-full border border-stone-200 bg-white/80 px-3 text-xs font-semibold text-brown-700 transition hover:border-brown-300 hover:text-brown-900"
      aria-label={locale === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
    >
      {otherLocale === 'de' ? 'DE' : 'EN'}
    </Link>
  )
}
