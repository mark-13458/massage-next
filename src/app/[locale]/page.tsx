import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HeroSection } from '../../components/site/HeroSection'
import { SectionShell } from '../../components/site/SectionShell'
import { ServiceCard } from '../../components/site/ServiceCard'
import { FloatingActions } from '../../components/site/FloatingActions'
import { SiteFooter } from '../../components/site/SiteFooter'
import { SiteHeader } from '../../components/site/SiteHeader'
import { getMessages } from '../../lib/copy'
import { isLocale, Locale } from '../../lib/i18n'
import { createPageMetadata, getBaseUrl } from '../../lib/seo'
import { buildLocalBusinessJsonLd } from '../../lib/structured-data'
import {
  getActiveFaqs,
  getActiveServices,
  getBusinessHours,
  getContactSettings,
  getPublishedTestimonials,
  getSystemSettings,
} from '../../server/services/site.service'

const homeGallery = [
  'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1200',
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const settings = await getSystemSettings().catch(() => null)

  return createPageMetadata({
    locale,
    pathname: '',
    title:
      locale === 'de'
        ? 'Traditionelle Chinesische Massage in München'
        : 'Traditional Chinese Massage in Munich',
    description:
      locale === 'de'
        ? settings?.seoMetaDescriptionDe || 'Entdecken Sie traditionelle chinesische Massage in München mit moderner, ruhiger Studioatmosphäre, transparenten Behandlungen und einfacher Terminanfrage.'
        : settings?.seoMetaDescriptionEn || 'Discover traditional Chinese massage in Munich with a calm modern studio atmosphere, transparent treatments and a simple appointment request flow.',
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [services, testimonials, faqs, hours, contact, settings] = await Promise.all([
    getActiveServices(typedLocale).catch(() => []),
    getPublishedTestimonials(typedLocale).catch(() => []),
    getActiveFaqs(typedLocale).catch(() => []),
    getBusinessHours(typedLocale).catch(() => []),
    getContactSettings().catch(() => null),
    getSystemSettings().catch(() => null),
  ])

  const localBusinessJsonLd = buildLocalBusinessJsonLd({
    locale: typedLocale,
    contact,
    hours,
    settings,
    url: new URL(`/${typedLocale}`, getBaseUrl()).toString(),
  })

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <SiteHeader locale={typedLocale} />
      <HeroSection locale={typedLocale} />

      {/* Services */}
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Ausgewählte Behandlungen' : 'Selected services'}
        title={t.sections.featuredServices}
        description={
          typedLocale === 'de'
            ? 'Ausgewählte Behandlungen mit klarer Dauer, transparenter Preisstruktur und einem ruhigen Wellness-Gefühl auf einen Blick.'
            : 'Selected treatments presented with clear durations, transparent pricing and a calm wellness atmosphere at a glance.'
        }
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <ServiceCard
              key={service.id}
              name={service.name}
              summary={service.summary}
              durationMin={service.durationMin}
              price={service.price.toString()}
              featured={service.isFeatured}
              currency={settings?.currency || 'EUR'}
              locale={typedLocale}
              slug={service.slug}
            />
          ))}
          {services.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
              <p className="text-sm text-brown-600">
                {typedLocale === 'de'
                  ? 'Behandlungen werden in Kürze veröffentlicht.'
                  : 'Treatments will be published shortly.'}
              </p>
              <Link
                href={`/${typedLocale}/contact`}
                className="mt-4 inline-flex rounded-full border border-brown-300 px-5 py-2.5 text-sm font-medium text-brown-800 transition hover:border-brown-500"
              >
                {typedLocale === 'de' ? 'Jetzt anfragen' : 'Get in touch'}
              </Link>
            </div>
          )}
        </div>
        {services.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={`/${typedLocale}/services`}
              className="inline-flex rounded-full border border-brown-300 bg-white px-5 py-3 text-sm font-medium text-brown-800 transition hover:border-brown-500"
            >
              {typedLocale === 'de' ? 'Alle Behandlungen ansehen' : 'View all treatments'}
            </Link>
          </div>
        )}
      </SectionShell>

      {/* Gallery preview */}
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Studio & Atmosphäre' : 'Studio atmosphere'}
        title={typedLocale === 'de' ? 'Der erste Eindruck beginnt mit dem Raumgefühl' : 'The first impression begins with the atmosphere'}
        description={
          typedLocale === 'de'
            ? 'Wärme, Ruhe und Vertrauen – das Studio ist ein Ort, an dem Gäste sich sofort wohlfühlen sollen.'
            : 'Warmth, calm and trust – the studio is designed to make guests feel at ease from the very first moment.'
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          {homeGallery.map((image, index) => (
            <div
              key={image}
              className={`overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft ${index === 1 ? 'md:translate-y-8' : ''}`}
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={image}
                  alt={typedLocale === 'de' ? 'Studio-Atmosphäre' : 'Studio atmosphere'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href={`/${typedLocale}/gallery`}
            className="inline-flex rounded-full border border-brown-300 bg-white px-5 py-3 text-sm font-medium text-brown-800 transition hover:border-brown-500"
          >
            {typedLocale === 'de' ? 'Zur Galerie' : 'View gallery'}
          </Link>
        </div>
      </SectionShell>

      {/* Testimonials */}
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Gästestimmen' : 'Guest feedback'}
        title={t.sections.testimonials}
        description={
          typedLocale === 'de'
            ? 'Echte Stimmen und Eindrücke helfen neuen Gästen, schneller Vertrauen aufzubauen.'
            : 'Real voices and impressions help new guests build trust more quickly.'
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
              {item.rating != null && item.rating > 0 && (
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < item.rating! ? 'text-amber-400' : 'text-stone-200'}>
                      {'★'}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-base leading-7 text-brown-800">{'"'}{item.content}{'"'}</p>
              <p className="mt-4 text-sm font-semibold text-brown-600">{'— '}{item.customerName}</p>
            </article>
          ))}
          {testimonials.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-soft">
              <div className="mb-3 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400">{'★'}</span>
                ))}
              </div>
              <p className="text-sm text-brown-600">
                {typedLocale === 'de'
                  ? 'Gästestimmen werden in Kürze veröffentlicht. Wir freuen uns auf Ihren Besuch.'
                  : 'Guest reviews will be published shortly. We look forward to welcoming you.'}
              </p>
            </div>
          )}
        </div>
      </SectionShell>

      {/* Hours & Contact */}
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Öffnungszeiten & Kontakt' : 'Hours & contact'}
        title={typedLocale === 'de' ? 'Alle wichtigen Infos für Ihren Besuch' : 'Everything you need to plan your visit'}
        description={
          typedLocale === 'de'
            ? 'Öffnungszeiten und Kontaktinfos direkt auf der Startseite – damit Gäste schnell eine Entscheidung treffen können.'
            : 'Opening hours and contact details right on the homepage – so guests can decide quickly and easily.'
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
            <h3 className="text-2xl font-semibold text-brown-900">
              {typedLocale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
            </h3>
            <div className="mt-5 divide-y divide-stone-100">
              {hours.length > 0 ? hours.map((item) => (
                <div key={item.weekday} className="flex items-center justify-between py-3 text-sm text-brown-700">
                  <span className="font-medium text-brown-900">{item.label}</span>
                  <span>{item.isClosed ? (typedLocale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}</span>
                </div>
              )) : (
                <p className="py-4 text-sm text-brown-600">
                  {typedLocale === 'de' ? 'Mo–Sa 09:30–20:00 · So nach Vereinbarung' : 'Mon–Sat 09:30–20:00 · Sun by arrangement'}
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-100 shadow-soft sm:p-8">
            <h3 className="text-2xl font-semibold text-white">
              {typedLocale === 'de' ? 'Kontakt' : 'Contact'}
            </h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
              <p>
                <span className="font-semibold text-white">{typedLocale === 'de' ? 'Adresse' : 'Address'}:</span>{' '}
                {contact?.address ?? 'Arnulfstraße 104, 80636 München'}
              </p>
              <p>
                <span className="font-semibold text-white">{typedLocale === 'de' ? 'Telefon' : 'Phone'}:</span>{' '}
                <a
                  href={`tel:${(contact?.phone ?? '015563188800').replace(/\s/g, '')}`}
                  className="hover:text-white transition"
                >
                  {contact?.phone ?? '015563 188800'}
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">E-Mail:</span>{' '}
                <a
                  href={`mailto:${contact?.email ?? 'chinesischemassage8@gmail.com'}`}
                  className="hover:text-white transition"
                >
                  {contact?.email ?? 'chinesischemassage8@gmail.com'}
                </a>
              </p>
              <p>
                <span className="font-semibold text-white">{typedLocale === 'de' ? 'Sprachen' : 'Languages'}:</span>{' '}
                {typedLocale === 'de' ? 'Deutsch · Englisch · Chinesisch' : 'German · English · Chinese'}
              </p>
            </div>
            <div className="mt-6">
              <Link
                href={`/${typedLocale}/booking`}
                className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-brown-900 transition hover:bg-stone-100"
              >
                {typedLocale === 'de' ? 'Termin anfragen' : 'Request appointment'}
              </Link>
            </div>
          </article>
        </div>
      </SectionShell>

      {/* FAQ */}
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Häufige Fragen' : 'Common questions'}
        title={t.sections.faq}
        description={
          typedLocale === 'de'
            ? 'Antworten auf typische Fragen zu Ablauf, Vorbereitung und Ihrem Besuch im Studio.'
            : 'Answers to common questions about your visit, preparation and the booking process.'
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-brown-900">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-brown-700">{faq.answer}</p>
            </article>
          ))}
          {faqs.length === 0 && (
            <div className="col-span-full rounded-[2rem] border border-stone-200 bg-white p-8 shadow-soft">
              <h3 className="text-lg font-semibold text-brown-900">
                {typedLocale === 'de' ? 'Wie läuft eine Terminanfrage ab?' : 'How does the booking request work?'}
              </h3>
              <p className="mt-3 text-sm leading-7 text-brown-700">
                {typedLocale === 'de'
                  ? 'Füllen Sie das Formular auf der Buchungsseite aus und wählen Sie Ihre Wunschbehandlung. Das Studio meldet sich zur Bestätigung der Verfügbarkeit.'
                  : 'Fill in the form on the booking page and select your preferred treatment. The studio will follow up to confirm availability.'}
              </p>
            </div>
          )}
        </div>
      </SectionShell>

      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
