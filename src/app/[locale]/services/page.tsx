import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { FloatingActions } from '../../../components/site/FloatingActions'
import { SectionShell } from '../../../components/site/SectionShell'
import { ServiceCard } from '../../../components/site/ServiceCard'
import { ZenServicesPage } from '../../../components/site/zen/ZenServicesPage'
import { getMessages } from '../../../lib/copy'
import { isLocale, Locale } from '../../../lib/i18n'
import { createPageMetadata, getBaseUrl } from '../../../lib/seo'
import { buildItemListJsonLd } from '../../../lib/structured-data'
import { getActiveServices, getSystemSettings } from '../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const settings = await getSystemSettings().catch(() => null)

  return createPageMetadata({
    locale,
    pathname: '/services',
    title: locale === 'de' ? 'Massagen & Behandlungen' : 'Massages & Treatments',
    description:
      locale === 'de'
        ? settings?.seoMetaDescriptionDe || 'Entdecken Sie Massagen und Behandlungen mit klarer Dauer, transparenten Preisen und einer ruhigen Studioatmosphäre in München.'
        : settings?.seoMetaDescriptionEn || 'Explore massages and treatments with clear durations, transparent pricing and a calm studio atmosphere in Munich.',
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [services, settings] = await Promise.all([
    getActiveServices(typedLocale).catch(() => []),
    getSystemSettings().catch(() => null),
  ])

  if (settings?.frontendTheme === 'zen') {
    return <ZenServicesPage locale={typedLocale} />
  }

  const baseUrl = getBaseUrl().toString().replace(/\/$/, '')
  const itemListJsonLd = buildItemListJsonLd(
    services.map((s) => ({
      name: s.name,
      url: `${baseUrl}/${typedLocale}/services/${s.slug}`,
    }))
  )

  return (
    <main>
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Leistungen' : 'Treatments'}
        title={t.nav.services}
        description={
          typedLocale === 'de'
            ? 'Entdecken Sie unsere Massagen und Behandlungen – mit klarer Dauer und transparenten Preisen.'
            : 'Explore our massages and treatments – with clear durations and transparent pricing.'
        }
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.length === 0 ? (
            <div className="col-span-full rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-card">
              <div className="flex justify-center">
                <svg
                  className="h-16 w-16 text-amber-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2 2-2 4-4 4-4S9 3 7 7c0 0 2-2 4-2-4 2-5 7-5 7 2-2 5-3 5-3-3 2-4 6-4 6 2-2 5-2 5-2-2 2-3 5-3 5 2-1 4-1 4-1-1 2-2 4-2 4l1.5.5C14.5 21 17 8 17 8z" />
                </svg>
              </div>
              <p className="mt-4 font-serif text-lg font-semibold text-brown-900">
                {typedLocale === 'de' ? 'Noch keine Behandlungen verfügbar' : 'No treatments available yet'}
              </p>
              <p className="mt-2 font-sans text-sm text-brown-500">
                {typedLocale === 'de'
                  ? 'Wir arbeiten gerade an unserem Angebot. Kontaktieren Sie uns für individuelle Anfragen.'
                  : 'We are currently preparing our offerings. Contact us for individual inquiries.'}
              </p>
              <Link
                href={`/${typedLocale}/contact`}
                className="mt-6 inline-flex rounded-full border border-amber-200 bg-amber-50 px-6 py-2.5 font-sans text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                {typedLocale === 'de' ? 'Kontakt aufnehmen' : 'Get in touch'}
              </Link>
            </div>
          ) : (
            services.map((service) => (
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
                coverImageUrl={service.coverImageFilePath}
              />
            ))
          )}
        </div>
        <div className="mt-12 rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-center shadow-soft">
          <p className="text-lg font-semibold text-white">
            {typedLocale === 'de' ? 'Bereit für Ihre Behandlung?' : 'Ready to book your treatment?'}
          </p>
          <p className="mt-2 text-sm text-stone-300">
            {typedLocale === 'de'
              ? 'Wählen Sie Ihre Wunschbehandlung und senden Sie eine Terminanfrage – das Studio bestätigt die Verfügbarkeit.'
              : 'Choose your preferred treatment and send an appointment request – the studio will confirm availability.'}
          </p>
          <Link
            href={`/${typedLocale}/booking`}
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brown-900 transition hover:bg-stone-100"
          >
            {typedLocale === 'de' ? 'Termin anfragen' : 'Request appointment'}
          </Link>
        </div>
      </SectionShell>
      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
