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
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Grid: 2 cols on mobile, 4 on lg */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <p className="text-base font-semibold text-white">{siteName}</p>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              {locale === 'de'
                ? 'Traditionelle chinesische Behandlungen in ruhiger, moderner Studioatmosphäre.'
                : 'Traditional Chinese treatments in a calm, modern studio atmosphere.'}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {locale === 'de' ? 'Navigation' : 'Navigation'}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li><Link href={`/${locale}/services`} className="hover:text-white transition-colors">{locale === 'de' ? 'Leistungen' : 'Services'}</Link></li>
              <li><Link href={`/${locale}/about`} className="hover:text-white transition-colors">{locale === 'de' ? 'Über uns' : 'About'}</Link></li>
              <li><Link href={`/${locale}/gallery`} className="hover:text-white transition-colors">{locale === 'de' ? 'Galerie' : 'Gallery'}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">{locale === 'de' ? 'Kontakt' : 'Contact'}</Link></li>
              <li><Link href={`/${locale}/booking`} className="hover:text-white transition-colors">{locale === 'de' ? 'Termin anfragen' : 'Book now'}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {locale === 'de' ? 'Kontakt' : 'Contact'}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-stone-400">
              <li className="leading-5">{contact?.address || 'Arnulfstraße 104, 80636 München'}</li>
              <li>
                <a href={`tel:${(contact?.phone || '015563188800').replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {contact?.phone || '015563 188800'}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact?.email || 'chinesischemassage8@gmail.com'}`} className="hover:text-white transition-colors break-all">
                  {contact?.email || 'chinesischemassage8@gmail.com'}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              {locale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
            </p>
            <div className="mt-3 space-y-1.5 text-sm text-stone-400">
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
      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-stone-600">© {new Date().getFullYear()} {siteName}</p>
          <div className="flex gap-4 text-xs text-stone-600">
            <Link href={`/${locale}/impressum`} className="hover:text-stone-300 transition-colors">Impressum</Link>
            <Link href={`/${locale}/privacy`} className="hover:text-stone-300 transition-colors">{locale === 'de' ? 'Datenschutz' : 'Privacy'}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
