import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HeroSection } from '../../components/site/HeroSection'
import { SectionShell } from '../../components/site/SectionShell'
import { ServiceCard } from '../../components/site/ServiceCard'
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

  return createPageMetadata({
    locale,
    pathname: '',
    title:
      locale === 'de'
        ? 'Traditionelle Chinesische Massage in München'
        : 'Traditional Chinese Massage in Munich',
    description:
      locale === 'de'
        ? 'Entdecken Sie traditionelle chinesische Massage in München mit moderner, ruhiger Studioatmosphäre, transparenten Behandlungen und einfacher Terminanfrage.'
        : 'Discover traditional Chinese massage in Munich with a calm modern studio atmosphere, transparent treatments and a simple appointment request flow.',
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
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Studio & Atmosphäre' : 'Studio atmosphere'}
        title={typedLocale === 'de' ? 'Der erste Eindruck beginnt mit dem Raumgefühl' : 'The first impression begins with the atmosphere'}
        description={
          typedLocale === 'de'
            ? 'Das Studio soll Wärme, Ruhe und Vertrauen ausstrahlen – nicht nur Leistungen auflisten.'
            : 'The studio should communicate warmth, calm and trust, not just list treatments.'
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          {homeGallery.map((image, index) => (
            <div key={image} className={`overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft ${index === 1 ? 'md:translate-y-8' : ''}`}>
              <img src={image} alt="Studio gallery preview" className="aspect-[4/5] w-full object-cover" />
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
              <p className="text-base leading-7 text-brown-800">“{item.content}”</p>
              <p className="mt-4 text-sm font-semibold text-brown-600">— {item.customerName}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Öffnungszeiten & Kontakt' : 'Hours & contact'}
        title={typedLocale === 'de' ? 'Alle wichtigen Infos für Ihren Besuch' : 'Clear visit and booking information'}
        description={
          typedLocale === 'de'
            ? 'Öffnungszeiten und Kontaktinfos direkt auf der Startseite helfen Gästen, schneller eine Entscheidung zu treffen.'
            : 'Showing opening hours and contact details directly on the homepage reduces friction for potential guests.'
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
            <h3 className="text-2xl font-semibold text-brown-900">{typedLocale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}</h3>
            <div className="mt-5 divide-y divide-stone-100">
              {hours.map((item) => (
                <div key={item.weekday} className="flex items-center justify-between py-3 text-sm text-brown-700">
                  <span className="font-medium text-brown-900">{item.label}</span>
                  <span>{item.isClosed ? (typedLocale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-stone-200 bg-stone-950 p-6 text-stone-100 shadow-soft sm:p-8">
            <h3 className="text-2xl font-semibold text-white">{typedLocale === 'de' ? 'Kontakt' : 'Contact'}</h3>
            <div className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
              <p><span className="font-semibold text-white">{typedLocale === 'de' ? 'Adresse' : 'Address'}:</span> {contact?.address ?? 'Arnulfstraße 104, 80636 München'}</p>
              <p><span className="font-semibold text-white">{typedLocale === 'de' ? 'Telefon' : 'Phone'}:</span> {contact?.phone ?? '015563 188800'}</p>
              <p><span className="font-semibold text-white">E-Mail:</span> {contact?.email ?? 'chinesischemassage8@gmail.com'}</p>
              <p><span className="font-semibold text-white">{typedLocale === 'de' ? 'Währung' : 'Currency'}:</span> {settings?.currency || 'EUR'}</p>
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
        </div>
      </SectionShell>

      <SiteFooter locale={typedLocale} />
    </main>
  )
}
