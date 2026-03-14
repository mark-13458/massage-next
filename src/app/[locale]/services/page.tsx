import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
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
            ? 'Klar strukturierte Leistungen mit transparenter Dauer und Preislogik. Die Inhalte werden später vollständig aus dem Admin gepflegt.'
            : 'Clearly structured treatments with transparent duration and pricing. This content will later be fully managed from the admin side.'
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
            />
          ))}
        </div>
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
