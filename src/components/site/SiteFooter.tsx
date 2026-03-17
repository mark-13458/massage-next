import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getBusinessHours, getContactSettings, getSystemSettings } from '../../server/services/site.service'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [settings, contact, hours] = await Promise.all([
    getSystemSettings().catch(() => null),
    getContactSettings().catch(() => null),
    getBusinessHours(locale).catch(() => []),
  ])

  const siteName = settings?.siteName || 'China TCM Massage'

  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <p className="font-serif text-base font-semibold text-white">{siteName}</p>
            <p className="mt-2.5 font-sans text-sm leading-6 text-stone-400">
              {locale === 'de'
                ? 'Traditionelle chinesische Behandlungen in ruhiger, moderner Studioatmosphäre.'
                : 'Traditional Chinese treatments in a calm, modern studio atmosphere.'}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {locale === 'de' ? 'Navigation' : 'Navigation'}
            </p>
            <ul className="mt-4 space-y-2.5 font-sans text-sm text-stone-400">
              <li>
                <Link href={`/${locale}/services`} className="transition-colors duration-150 hover:text-white cursor-pointer">
                  {locale === 'de' ? 'Leistungen' : 'Services'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="transition-colors duration-150 hover:text-white cursor-pointer">
                  {locale === 'de' ? 'Über uns' : 'About'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/gallery`} className="transition-colors duration-150 hover:text-white cursor-pointer">
                  {locale === 'de' ? 'Galerie' : 'Gallery'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="transition-colors duration-150 hover:text-white cursor-pointer">
                  {locale === 'de' ? 'Kontakt' : 'Contact'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/booking`} className="transition-colors duration-150 hover:text-white cursor-pointer">
                  {locale === 'de' ? 'Termin anfragen' : 'Book now'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {locale === 'de' ? 'Kontakt' : 'Contact'}
            </p>
            <ul className="mt-4 space-y-2.5 font-sans text-sm text-stone-400">
              <li className="leading-5">{contact?.address || 'Arnulfstraße 104, 80636 München'}</li>
              <li>
                <a
                  href={`tel:${(contact?.phone || '015563188800').replace(/\s/g, '')}`}
                  className="transition-colors duration-150 hover:text-white cursor-pointer"
                >
                  {contact?.phone || '015563 188800'}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact?.email || 'chinesischemassage8@gmail.com'}`}
                  className="break-all transition-colors duration-150 hover:text-white cursor-pointer"
                >
                  {contact?.email || 'chinesischemassage8@gmail.com'}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {locale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
            </p>
            <div className="mt-4 space-y-1.5 font-sans text-sm text-stone-400">
              {hours.length > 0 ? hours.map((item) => (
                <p key={item.weekday}>
                  <span className="text-stone-300">{item.label}:</span>{' '}
                  {item.isClosed ? (locale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}
                </p>
              )) : (
                <p>Mo–So 09:30–20:00</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="font-sans text-xs text-stone-600">© {new Date().getFullYear()} {siteName}</p>
          <div className="flex gap-5 font-sans text-xs text-stone-600">
            <Link href={`/${locale}/impressum`} className="transition-colors duration-150 hover:text-stone-300 cursor-pointer">
              Impressum
            </Link>
            <Link href={`/${locale}/privacy`} className="transition-colors duration-150 hover:text-stone-300 cursor-pointer">
              {locale === 'de' ? 'Datenschutz' : 'Privacy'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
