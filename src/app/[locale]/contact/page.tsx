import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { SectionShell } from '../../../components/site/SectionShell'
import { isLocale, Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getBusinessHours, getContactSettings } from '../../../server/services/site.service'

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [hours, contact] = await Promise.all([
    getBusinessHours(typedLocale).catch(() => []),
    getContactSettings().catch(() => null),
  ])

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Kontakt' : 'Contact'}
        title={t.sections.contact}
        description={
          typedLocale === 'de'
            ? '这页先把联系信息、营业时间和到店信息打通，后面再补地图、路线说明和更细的本地 SEO。'
            : 'This page now connects contact details, opening hours and visit information; maps, directions and deeper local SEO will follow next.'
        }
      >
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-3xl border border-stone-200 bg-stone-950 p-8 text-stone-100 shadow-sm">
            <h2 className="text-2xl font-semibold text-white">
              {typedLocale === 'de' ? 'Direkter Kontakt' : 'Direct contact'}
            </h2>
            <div className="mt-6 space-y-5 text-sm text-stone-300">
              <div>
                <p className="font-semibold text-white">{typedLocale === 'de' ? 'Adresse' : 'Address'}</p>
                <p className="mt-2">{contact?.address ?? 'Arnulfstraße 104, 80636 München'}</p>
              </div>
              <div>
                <p className="font-semibold text-white">{typedLocale === 'de' ? 'Telefon' : 'Phone'}</p>
                <p className="mt-2">{contact?.phone ?? '015563 188800'}</p>
              </div>
              <div>
                <p className="font-semibold text-white">E-Mail</p>
                <p className="mt-2">{contact?.email ?? 'chinesischemassage8@gmail.com'}</p>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-brown-900">
                {typedLocale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
              </h2>
              <div className="mt-5 divide-y divide-stone-100">
                {hours.map((item) => (
                  <div key={item.weekday} className="flex items-center justify-between py-3 text-sm text-brown-700">
                    <span className="font-medium text-brown-900">{item.label}</span>
                    <span>{item.isClosed ? (typedLocale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-brown-900">
                {typedLocale === 'de' ? 'Besuchshinweise' : 'Visit notes'}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-brown-700">
                <p>
                  {typedLocale === 'de'
                    ? 'Die Seite ist bereits so vorbereitet, dass Adresse, Telefon und Zeiten später zentral über SiteSetting / BusinessHour gepflegt werden können.'
                    : 'This page is already prepared so that address, phone and opening times can later be managed centrally via SiteSetting and BusinessHour.'}
                </p>
                <p>
                  {typedLocale === 'de'
                    ? 'Als nächster Schritt können wir hier Google Maps, Anfahrtsbeschreibung, Parkhinweise und strukturierte LocalBusiness-Daten ergänzen.'
                    : 'The next step here is to add Google Maps, travel directions, parking notes and structured LocalBusiness data.'}
                </p>
              </div>
            </article>
          </div>
        </div>
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
