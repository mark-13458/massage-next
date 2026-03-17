import Link from 'next/link'
import { Locale } from '../../../lib/i18n'
import { getBusinessHours, getContactSettings, getSystemSettings } from '../../../server/services/site.service'

export async function ZenFooter({ locale }: { locale: Locale }) {
  const [settings, contact, hours] = await Promise.all([
    getSystemSettings().catch(() => null),
    getContactSettings().catch(() => null),
    getBusinessHours(locale).catch(() => []),
  ])

  const siteName = settings?.siteName || 'Zen Oase'

  return (
    <footer className="border-t border-[rgba(155,126,92,0.15)] bg-[#FAF8F5]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9B7E5C]">
                <span className="text-sm font-semibold text-white">Z</span>
              </div>
              <span className="font-semibold text-[#3D3630]">{siteName}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#8C7D6F]">
              {locale === 'de'
                ? 'Premium Massage und Wellness in entspannter, moderner Atmosphäre.'
                : 'Premium massage and wellness in a relaxed, modern atmosphere.'}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8C7D6F]">
              {locale === 'de' ? 'Navigation' : 'Navigation'}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#8C7D6F]">
              {[
                { href: `/${locale}/services`, label: locale === 'de' ? 'Leistungen' : 'Services' },
                { href: `/${locale}/about`, label: locale === 'de' ? 'Über uns' : 'About' },
                { href: `/${locale}/gallery`, label: locale === 'de' ? 'Galerie' : 'Gallery' },
                { href: `/${locale}/contact`, label: locale === 'de' ? 'Kontakt' : 'Contact' },
                { href: `/${locale}/booking`, label: locale === 'de' ? 'Termin anfragen' : 'Book now' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-[#9B7E5C]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8C7D6F]">
              {locale === 'de' ? 'Kontakt' : 'Contact'}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-[#8C7D6F]">
              <li className="leading-5">{contact?.address || 'Arnulfstraße 104, 80636 München'}</li>
              <li>
                <a href={`tel:${(contact?.phone || '015563188800').replace(/\s/g, '')}`} className="transition-colors hover:text-[#9B7E5C]">
                  {contact?.phone || '015563 188800'}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact?.email || 'chinesischemassage8@gmail.com'}`} className="break-all transition-colors hover:text-[#9B7E5C]">
                  {contact?.email || 'chinesischemassage8@gmail.com'}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8C7D6F]">
              {locale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
            </p>
            <div className="mt-4 space-y-1.5 text-sm text-[#8C7D6F]">
              {hours.length > 0 ? hours.map((item) => (
                <p key={item.weekday}>
                  <span className="text-[#3D3630]">{item.label}:</span>{' '}
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
      <div className="border-t border-[rgba(155,126,92,0.15)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-[#8C7D6F]">© {new Date().getFullYear()} {siteName}</p>
          <div className="flex gap-5 text-xs text-[#8C7D6F]">
            <Link href={`/${locale}/impressum`} className="transition-colors hover:text-[#9B7E5C]">Impressum</Link>
            <Link href={`/${locale}/privacy`} className="transition-colors hover:text-[#9B7E5C]">
              {locale === 'de' ? 'Datenschutz' : 'Privacy'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
