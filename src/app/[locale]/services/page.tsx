import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { SectionShell } from '../../../components/site/SectionShell'
import { ServiceCard } from '../../../components/site/ServiceCard'
import { getMessages } from '../../../lib/copy'
import { isLocale, Locale } from '../../../lib/i18n'
import { getActiveServices } from '../../../server/services/site.service'

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const services = await getActiveServices(typedLocale).catch(() => [])

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Leistungen' : 'Treatments'}
        title={t.nav.services}
        description={
          typedLocale === 'de'
            ? 'Klar strukturierte Leistungen mit transparenter Dauer und Preislogik. Die Inhalte werden später vollständig aus dem后台维护。'
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
            />
          ))}
        </div>
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
