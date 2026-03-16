import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { FloatingActions } from '../../../components/site/FloatingActions'
import { SectionShell } from '../../../components/site/SectionShell'
import { isLocale, Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { createPageMetadata, getBaseUrl } from '../../../lib/seo'
import { buildLocalBusinessJsonLd } from '../../../lib/structured-data'
import { getBusinessHours, getContactSettings, getSystemSettings } from '../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const settings = await getSystemSettings().catch(() => null)

  return createPageMetadata({
    locale,
    pathname: '/contact',
    title: locale === 'de' ? 'Kontakt & Öffnungszeiten' : 'Contact & Opening Hours',
    description:
      locale === 'de'
        ? settings?.seoMetaDescriptionDe || 'Finden Sie Adresse, Telefonnummer, E-Mail und Öffnungszeiten von China TCM Massage in München auf einen Blick.'
        : settings?.seoMetaDescriptionEn || 'Find the address, phone number, email and opening hours of China TCM Massage in Munich at a glance.',
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [hours, contact, settings] = await Promise.all([
    getBusinessHours(typedLocale).catch(() => []),
    getContactSettings().catch(() => null),
    getSystemSettings().catch(() => null),
  ])

  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    locale: typedLocale,
    contact,
    hours,
    settings,
    url: new URL(`/${typedLocale}/contact`, getBaseUrl()).toString(),
  })

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Kontakt' : 'Contact'}
        title={t.sections.contact}
        description={
          typedLocale === 'de'
            ? 'Alle wichtigen Kontaktinformationen, Öffnungszeiten und Hinweise für Ihren Besuch kompakt an einem Ort.'
            : 'All essential contact details, opening hours and visit notes gathered in one clear place.'
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
                <a href={`tel:${(contact?.phone ?? '015563188800').replace(/\s/g, '')}`} className="mt-2 block hover:text-white transition">
                  {contact?.phone ?? '015563 188800'}
                </a>
              </div>
              <div>
                <p className="font-semibold text-white">E-Mail</p>
                <a href={`mailto:${contact?.email ?? 'chinesischemassage8@gmail.com'}`} className="mt-2 block hover:text-white transition">
                  {contact?.email ?? 'chinesischemassage8@gmail.com'}
                </a>
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
                    ? 'Bitte kommen Sie pünktlich zu Ihrem Termin. Falls Sie sich verspäten, informieren Sie uns bitte telefonisch.'
                    : 'Please arrive on time for your appointment. If you are running late, please let us know by phone.'}
                </p>
                <p>
                  {typedLocale === 'de'
                    ? 'Wir empfehlen, bequeme Kleidung zu tragen. Für Ihre Wertsachen stehen Schließfächer zur Verfügung.'
                    : 'We recommend wearing comfortable clothing. Lockers are available for your valuables.'}
                </p>
                <p>
                  {typedLocale === 'de'
                    ? 'Parkplätze sind in der Umgebung vorhanden. Mit öffentlichen Verkehrsmitteln erreichen Sie uns bequem über die nächste U-Bahn-Station.'
                    : 'Parking is available nearby. You can also reach us conveniently by public transport via the nearest metro station.'}
                </p>
              </div>
            </article>
          </div>
        </div>
      </SectionShell>

      <section className="py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-stone-200 shadow-sm">
            <iframe
              title={typedLocale === 'de' ? 'Standort auf der Karte' : 'Location on map'}
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

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-center shadow-soft">
            <p className="text-lg font-semibold text-white">
              {typedLocale === 'de' ? 'Bereit für Ihren Termin?' : 'Ready to book your appointment?'}
            </p>
            <p className="mt-2 text-sm text-stone-300">
              {typedLocale === 'de'
                ? 'Fragen Sie Ihren Wunschtermin online an – das Studio bestätigt die Verfügbarkeit.'
                : 'Request your preferred slot online – the studio will confirm availability.'}
            </p>
            <Link
              href={`/${typedLocale}/booking`}
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brown-900 transition hover:bg-stone-100"
            >
              {typedLocale === 'de' ? 'Termin anfragen' : 'Request appointment'}
            </Link>
          </div>
        </div>
      </section>

      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
