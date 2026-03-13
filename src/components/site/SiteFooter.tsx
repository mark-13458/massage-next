import { Locale } from '../../lib/i18n'
import { getBusinessHours, getContactSettings, getSystemSettings } from '../../server/services/site.service'

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [settings, contact, hours] = await Promise.all([
    getSystemSettings().catch(() => null),
    getContactSettings().catch(() => null),
    getBusinessHours(locale).catch(() => []),
  ])

  const siteName = settings?.siteName || 'China TCM Massage'
  const footerHours = hours.slice(0, 3)

  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-lg font-semibold text-white">{siteName}</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            {locale === 'de'
              ? 'Modernes Wohlfühlambiente mit traditionellen Anwendungen, klarer Kommunikation und einfacher Terminbuchung.'
              : 'A modern wellness atmosphere with traditional treatments, clear communication and simple booking.'}
          </p>
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
    </footer>
  )
}
