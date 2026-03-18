import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getActiveServices, getSystemSettings } from '../../../server/services/site.service'
import { ZenPageShell } from './ZenPageShell'

export async function ZenServicesPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const [services, settings] = await Promise.all([
    getActiveServices(locale).catch(() => []),
    getSystemSettings().catch(() => null),
  ])
  const currency = settings?.currency || 'EUR'
  const currencySymbol = currency === 'EUR' ? '€' : currency

  return (
    <ZenPageShell locale={locale}>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B7E5C]">
            {locale === 'de' ? 'Leistungen' : 'Treatments'}
          </p>
          <h1 className="mt-3 text-4xl font-light text-[#3D3630] md:text-5xl">{t.nav.services}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8C7D6F]">
            {locale === 'de'
              ? 'Entdecken Sie unsere Massagen und Behandlungen – mit klarer Dauer und transparenten Preisen.'
              : 'Explore our massages and treatments – with clear durations and transparent pricing.'}
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-[4/3] overflow-hidden bg-[#E8DFD4] flex items-center justify-center">
                  <span className="text-5xl">🌿</span>
                </div>
                <div className="p-6">
                  {service.isFeatured && (
                    <span className="mb-3 inline-flex rounded-full bg-[#9B7E5C]/10 px-3 py-1 text-xs font-semibold text-[#9B7E5C]">
                      {locale === 'de' ? 'Empfohlen' : 'Featured'}
                    </span>
                  )}
                  <h2 className="mb-2 text-xl font-light text-[#3D3630]">{service.name}</h2>
                  <p className="mb-4 text-sm text-[#8C7D6F]">{service.summary}</p>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-[#8C7D6F]">{service.durationMin} min</span>
                    <span className="text-lg font-semibold text-[#9B7E5C]">
                      {currencySymbol}{Number(service.price).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/${locale}/services/${service.slug}`}
                      className="flex-1 rounded-md border border-[#9B7E5C] px-4 py-2 text-center text-sm text-[#9B7E5C] transition-colors hover:bg-[#9B7E5C]/5"
                    >
                      {locale === 'de' ? 'Details' : 'Details'}
                    </Link>
                    <Link
                      href={`/${locale}/booking?service=${service.slug}`}
                      className="flex-1 rounded-md bg-[#9B7E5C] px-4 py-2 text-center text-sm text-white transition-colors hover:bg-[#9B7E5C]/90"
                    >
                      {locale === 'de' ? 'Buchen' : 'Book'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {services.length === 0 && (
              <div className="col-span-full rounded-lg bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-[#8C7D6F]">
                  {locale === 'de' ? 'Behandlungen werden in Kürze veröffentlicht.' : 'Treatments will be published shortly.'}
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-lg bg-[#9B7E5C] p-8 text-center text-white">
            <p className="text-lg font-light">
              {locale === 'de' ? 'Bereit für Ihre Behandlung?' : 'Ready to book your treatment?'}
            </p>
            <p className="mt-2 text-sm opacity-80">
              {locale === 'de'
                ? 'Wählen Sie Ihre Wunschbehandlung und senden Sie eine Terminanfrage.'
                : 'Choose your preferred treatment and send an appointment request.'}
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
