import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getBusinessHours, getContactSettings } from '../../../server/services/site.service'
import { ZenPageShell } from './ZenPageShell'

export async function ZenContactPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const [hours, contact] = await Promise.all([
    getBusinessHours(locale).catch(() => []),
    getContactSettings().catch(() => null),
  ])

  return (
    <ZenPageShell locale={locale}>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B7E5C]">
            {locale === 'de' ? 'Kontakt' : 'Contact'}
          </p>
          <h1 className="mt-3 text-4xl font-light text-[#3D3630] md:text-5xl">{t.sections.contact}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8C7D6F]">
            {locale === 'de'
              ? 'Alle wichtigen Kontaktinformationen und Öffnungszeiten auf einen Blick.'
              : 'All essential contact details and opening hours at a glance.'}
          </p>
        </div>
      </section>

      {/* Contact + Hours */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Contact card */}
            <div className="rounded-lg bg-[#9B7E5C] p-8 text-white shadow-sm">
              <h2 className="text-2xl font-light">{locale === 'de' ? 'Direkter Kontakt' : 'Direct contact'}</h2>
              <div className="mt-6 space-y-5 text-sm text-white/80">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                    {locale === 'de' ? 'Adresse' : 'Address'}
                  </p>
                  <p className="mt-2">{contact?.address ?? 'Arnulfstraße 104, 80636 München'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                    {locale === 'de' ? 'Telefon' : 'Phone'}
                  </p>
                  <a href={`tel:${(contact?.phone ?? '015563188800').replace(/\s/g, '')}`} className="mt-2 block transition hover:text-white">
                    {contact?.phone ?? '015563 188800'}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/50">E-Mail</p>
                  <a href={`mailto:${contact?.email ?? 'chinesischemassage8@gmail.com'}`} className="mt-2 block break-all transition hover:text-white">
                    {contact?.email ?? 'chinesischemassage8@gmail.com'}
                  </a>
                </div>
              </div>
            </div>

            {/* Hours + visit notes */}
            <div className="grid gap-6">
              <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-light text-[#3D3630]">
                  {locale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
                </h2>
                <div className="mt-5 divide-y divide-[rgba(155,126,92,0.1)]">
                  {hours.length > 0 ? hours.map((item) => (
                    <div key={item.weekday} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-[#3D3630]">{item.label}</span>
                      <span className="text-[#8C7D6F]">
                        {item.isClosed ? (locale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}
                      </span>
                    </div>
                  )) : (
                    <p className="py-4 text-sm text-[#8C7D6F]">
                      {locale === 'de' ? 'Mo–Sa 09:30–20:00 · So nach Vereinbarung' : 'Mon–Sat 09:30–20:00 · Sun by arrangement'}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-light text-[#3D3630]">
                  {locale === 'de' ? 'Besuchshinweise' : 'Visit notes'}
                </h2>
                <div className="mt-5 space-y-3 text-sm leading-7 text-[#8C7D6F]">
                  <p>
                    {locale === 'de'
                      ? 'Bitte kommen Sie pünktlich zu Ihrem Termin. Falls Sie sich verspäten, informieren Sie uns bitte telefonisch.'
                      : 'Please arrive on time for your appointment. If you are running late, please let us know by phone.'}
                  </p>
                  <p>
                    {locale === 'de'
                      ? 'Wir empfehlen, bequeme Kleidung zu tragen. Parkplätze sind in der Umgebung vorhanden.'
                      : 'We recommend wearing comfortable clothing. Parking is available nearby.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-[rgba(155,126,92,0.15)] shadow-sm">
            <iframe
              title={locale === 'de' ? 'Standort auf der Karte' : 'Location on map'}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2662.0!2d11.5364!3d48.1441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479e75e9b5f5f5f5%3A0x1234567890abcdef!2sArnulfstra%C3%9Fe+104%2C+80636+M%C3%BCnchen%2C+Germany!5e0!3m2!1sde!2sde!4v1710000000000!5m2!1sde!2sde"
              width="100%"
              height="360"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-[#9B7E5C] p-8 text-center text-white">
            <p className="text-lg font-light">
              {locale === 'de' ? 'Bereit für Ihren Termin?' : 'Ready to book your appointment?'}
            </p>
            <Link
              href={`/${locale}/booking`}
              className="mt-6 inline-flex items-center rounded-md bg-white px-6 py-2.5 text-sm font-medium text-[#9B7E5C] transition hover:bg-white/90"
            >
              {locale === 'de' ? 'Termin anfragen' : 'Request appointment'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </ZenPageShell>
  )
}
