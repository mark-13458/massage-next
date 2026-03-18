import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '../../../../components/site/SiteHeader'
import { SiteFooter } from '../../../../components/site/SiteFooter'
import { FloatingActions } from '../../../../components/site/FloatingActions'
import { ServiceCard } from '../../../../components/site/ServiceCard'
import { ZenServiceDetailPage } from '../../../../components/site/zen/ZenServiceDetailPage'
import { isLocale, Locale } from '../../../../lib/i18n'
import { createPageMetadata, getBaseUrl } from '../../../../lib/seo'
import { buildServiceJsonLd } from '../../../../lib/structured-data'
import { getSystemSettings } from '../../../../server/services/site.service'
import { prisma } from '../../../../lib/prisma'

type Props = { params: Promise<{ locale: string; slug: string }> }

async function getService(slug: string) {
  return prisma.service.findUnique({
    where: { slug, isActive: true },
    include: { coverImage: { select: { filePath: true } } },
  })
}

async function getRelatedServices(slug: string, locale: string) {
  const services = await prisma.service.findMany({
    where: { isActive: true, slug: { not: slug } },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    take: 3,
    include: { coverImage: { select: { filePath: true } } },
  })
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: locale === 'de' ? s.nameDe : s.nameEn,
    summary: locale === 'de' ? s.summaryDe : s.summaryEn,
    durationMin: s.durationMin,
    price: s.price.toString(),
    isFeatured: s.isFeatured,
    coverImageFilePath: s.coverImage?.filePath ?? null,
  }))
}

export const dynamic = 'force-dynamic'
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
  const [service, settings, relatedServices] = await Promise.all([
    getService(slug),
    getSystemSettings().catch(() => null),
    getRelatedServices(slug, locale).catch(() => []),
  ])

  if (!service) notFound()

  if (settings?.frontendTheme === 'zen') {
    return (
      <ZenServiceDetailPage
        locale={typedLocale}
        service={service}
        relatedServices={relatedServices}
      />
    )
  }

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

  const siteBaseUrl = getBaseUrl().toString().replace(/\/$/, '')
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: typedLocale === 'de' ? 'Startseite' : 'Home', item: `${siteBaseUrl}/${typedLocale}` },
      { '@type': 'ListItem', position: 2, name: typedLocale === 'de' ? 'Leistungen' : 'Services', item: `${siteBaseUrl}/${typedLocale}/services` },
      { '@type': 'ListItem', position: 3, name, item: `${siteBaseUrl}/${typedLocale}/services/${service.slug}` },
    ],
  }

  const serviceJsonLd = buildServiceJsonLd({
    name,
    description: (summary || description) ?? undefined,
    price: Number(service.price).toFixed(2),
    currency,
    url: `${siteBaseUrl}/${typedLocale}/services/${service.slug}`,
    providerName: settings?.siteName || 'China TCM Massage',
    providerUrl: `${siteBaseUrl}/${typedLocale}`,
  })

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <SiteHeader locale={typedLocale} />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${typedLocale}/services`}
            className="text-sm text-brown-600 hover:text-brown-900 transition-colors"
          >
            {backLabel}
          </Link>

          {service.coverImage?.filePath && (
            <div
              className="relative w-full overflow-hidden rounded-3xl mt-6"
              style={{ aspectRatio: '16/9', maxHeight: '480px' }}
            >
              <Image
                src={service.coverImage.filePath}
                alt={name}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

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
              className="inline-flex items-center rounded-full bg-brown-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brown-800 transition-colors"
            >
              {bookingLabel}
            </Link>
          </div>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.26em] text-brown-500">
              {typedLocale === 'de' ? 'Weitere Behandlungen' : 'More treatments'}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-brown-900">
              {typedLocale === 'de' ? 'Das könnte Sie auch interessieren' : 'You might also like'}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedServices.map((s) => (
                <ServiceCard
                  key={s.id}
                  name={s.name}
                  summary={s.summary}
                  durationMin={s.durationMin}
                  price={s.price}
                  featured={s.isFeatured}
                  currency={currency}
                  locale={typedLocale}
                  slug={s.slug}
                  coverImageUrl={s.coverImageFilePath}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
