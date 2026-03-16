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
  const footerHours = hours.slice(0, 4)

  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-lg font-semibold text-white">{siteName}</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            {locale === 'de'
              ? 'Traditionelle chinesische Behandlungen in ruhiger, moderner Studioatmosphäre.'
              : 'Traditional Chinese treatments in a calm, modern studio atmosphere.'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
            {locale === 'de' ? 'Navigation' : 'Navigation'}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-300">
            <li><Link href={`/${locale}/services`} className="hover:text-white transition">{locale === 'de' ? 'Leistungen' : 'Services'}</Link></li>
            <li><Link href={`/${locale}/about`} className="hover:text-white transition">{locale === 'de' ? 'Über uns' : 'About'}</Link></li>
            <li><Link href={`/${locale}/gallery`} className="hover:text-white transition">{locale === 'de' ? 'Galerie' : 'Gallery'}</Link></li>
            <li><Link href={`/${locale}/contact`} className="hover:text-white transition">{locale === 'de' ? 'Kontakt' : 'Contact'}</Link></li>
            <li><Link href={`/${locale}/booking`} className="hover:text-white transition">{locale === 'de' ? 'Termin anfragen' : 'Book now'}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
            {locale === 'de' ? 'Kontakt' : 'Contact'}
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-stone-300">
            <li>{contact?.address || 'Arnulfstraße 104, 80636 München'}</li>
            <li>{contact?.phone || '015563 188800'}</li>
            <li>{contact?.email || 'chinesischemassage8@gmail.com'}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
            {locale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
          </h4>
          <div className="mt-3 space-y-2 text-sm text-stone-300">
            {footerHours.length > 0 ? footerHours.map((item) => (
              <p key={item.weekday}>{item.label}: {item.isClosed ? (locale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}</p>
            )) : <p>Mon–Sun 09:30–20:00</p>}
          </div>
        </div>
      </div>
      <div className="border-t border-stone-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-stone-500">© {new Date().getFullYear()} {siteName}</p>
          <div className="flex gap-5 text-xs text-stone-500">
            <Link href={`/${locale}/impressum`} className="hover:text-stone-300 transition">Impressum</Link>
            <Link href={`/${locale}/privacy`} className="hover:text-stone-300 transition">{locale === 'de' ? 'Datenschutz' : 'Privacy'}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
