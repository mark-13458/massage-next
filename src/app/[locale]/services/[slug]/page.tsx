import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '../../../../components/site/SiteHeader'
import { SiteFooter } from '../../../../components/site/SiteFooter'
import { isLocale, Locale } from '../../../../lib/i18n'
import { createPageMetadata } from '../../../../lib/seo'
import { getSystemSettings } from '../../../../server/services/site.service'
import { prisma } from '../../../../lib/prisma'

type Props = { params: Promise<{ locale: string; slug: string }> }

async function getService(slug: string) {
  return prisma.service.findUnique({
    where: { slug, isActive: true },
  })
}

export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    const locales = ['de', 'en']
    return locales.flatMap((locale) => services.map((s) => ({ locale, slug: s.slug })))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  const [service, settings] = await Promise.all([
    getService(slug),
    getSystemSettings().catch(() => null),
  ])
  if (!service) return {}

  const name = locale === 'de' ? service.nameDe : service.nameEn
  const description =
    (locale === 'de' ? service.summaryDe : service.summaryEn) ||
    (locale === 'de' ? service.descriptionDe : service.descriptionEn) ||
    undefined

  return createPageMetadata({
    locale,
    pathname: `/services/${slug}`,
    title: name,
    description: description ?? undefined,
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const typedLocale = locale as Locale
  const [service, settings] = await Promise.all([
    getService(slug),
    getSystemSettings().catch(() => null),
  ])

  if (!service) notFound()

  const name = typedLocale === 'de' ? service.nameDe : service.nameEn
  const summary = typedLocale === 'de' ? service.summaryDe : service.summaryEn
  const description = typedLocale === 'de' ? service.descriptionDe : service.descriptionEn
  const currency = settings?.currency || 'EUR'
  const currencySymbol = currency === 'EUR' ? '€' : currency

  const bookingLabel = typedLocale === 'de' ? 'Termin anfragen' : 'Request Appointment'
  const backLabel = typedLocale === 'de' ? '← Alle Behandlungen' : '← All Treatments'
  const durationLabel = typedLocale === 'de' ? 'Dauer' : 'Duration'
  const priceLabel = typedLocale === 'de' ? 'Preis' : 'Price'
  const minLabel = typedLocale === 'de' ? 'Min.' : 'min'

  return (
    <main>
      <SiteHeader locale={typedLocale} />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${typedLocale}/services`}
            className="text-sm text-brown-600 hover:text-brown-900 transition-colors"
          >
            {backLabel}
          </Link>

          <div className="mt-6">
            {service.isFeatured && (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900 mb-4">
                {typedLocale === 'de' ? 'Empfohlen' : 'Featured'}
              </span>
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-brown-900 sm:text-4xl">{name}</h1>
            {summary && (
              <p className="mt-4 text-lg leading-8 text-brown-700">{summary}</p>
            )}
          </div>

          <div className="mt-8 flex gap-8 border-y border-stone-200 py-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-brown-500">{durationLabel}</p>
              <p className="mt-1 text-2xl font-semibold text-brown-900">{service.durationMin} {minLabel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-brown-500">{priceLabel}</p>
              <p className="mt-1 text-2xl font-semibold text-brown-900">{currencySymbol} {Number(service.price).toFixed(2)}</p>
            </div>
          </div>

          {description && (
            <div className="mt-8 prose prose-stone max-w-none text-brown-700 leading-8">
              {description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          <div className="mt-10">
            <Link
              href={`/${typedLocale}/booking?service=${service.slug}`}
              className="inline-flex items-center rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
            >
              {bookingLabel}
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter locale={typedLocale} />
    </main>
  )
}
