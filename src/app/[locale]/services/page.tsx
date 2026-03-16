import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { FloatingActions } from '../../../components/site/FloatingActions'
import { SectionShell } from '../../../components/site/SectionShell'
import { ServiceCard } from '../../../components/site/ServiceCard'
import { getMessages } from '../../../lib/copy'
import { isLocale, Locale } from '../../../lib/i18n'
import { createPageMetadata } from '../../../lib/seo'
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

  return (
    <main>
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
          {services.map((service) => (
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
