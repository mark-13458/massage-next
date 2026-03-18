import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getSystemSettings } from '../../../server/services/site.service'
import { ServiceCard } from '../ServiceCard'
import { ZenPageShell } from './ZenPageShell'

interface Service {
  id: number
  slug: string
  nameDe: string
  nameEn: string
  summaryDe: string | null
  summaryEn: string | null
  descriptionDe: string | null
  descriptionEn: string | null
  durationMin: number
  price: { toString(): string }
  isFeatured: boolean
}

interface RelatedService {
  id: number
  slug: string
  name: string
  summary: string | null
  durationMin: number
  price: string
  isFeatured: boolean
}

interface Props {
  locale: Locale
  service: Service
  relatedServices: RelatedService[]
}

export async function ZenServiceDetailPage({ locale, service, relatedServices }: Props) {
  const settings = await getSystemSettings().catch(() => null)
  const currency = settings?.currency || 'EUR'
  const currencySymbol = currency === 'EUR' ? '€' : currency

  const name = locale === 'de' ? service.nameDe : service.nameEn
  const summary = locale === 'de' ? service.summaryDe : service.summaryEn
  const description = locale === 'de' ? service.descriptionDe : service.descriptionEn

  return (
    <ZenPageShell locale={locale}>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center text-sm text-[#9B7E5C] transition hover:text-[#9B7E5C]/80"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {locale === 'de' ? 'Alle Behandlungen' : 'All Treatments'}
          </Link>

          <div className="mt-6">
            {service.isFeatured && (
              <span className="mb-3 inline-flex rounded-full bg-[#9B7E5C]/10 px-3 py-1 text-xs font-semibold text-[#9B7E5C]">
                {locale === 'de' ? 'Empfohlen' : 'Featured'}
              </span>
            )}
            <h1 className="text-3xl font-light text-[#3D3630] sm:text-4xl">{name}</h1>
            {summary && <p className="mt-4 text-lg leading-8 text-[#8C7D6F]">{summary}</p>}
          </div>

          <div className="mt-8 flex gap-8 border-y border-[rgba(155,126,92,0.15)] py-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8C7D6F]">
                {locale === 'de' ? 'Dauer' : 'Duration'}
              </p>
              <p className="mt-1 text-2xl font-light text-[#3D3630]">
                {service.durationMin} {locale === 'de' ? 'Min.' : 'min'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#8C7D6F]">
                {locale === 'de' ? 'Preis' : 'Price'}
              </p>
              <p className="mt-1 text-2xl font-light text-[#9B7E5C]">
                {currencySymbol} {Number(service.price).toFixed(2)}
              </p>
            </div>
          </div>

          {description && (
            <div className="mt-8 space-y-4 text-sm leading-8 text-[#8C7D6F]">
              {description.split('\n').map((para, i) => <p key={i}>{para}</p>)}
            </div>
          )}

          <div className="mt-10">
            <Link
              href={`/${locale}/booking?service=${service.slug}`}
              className="inline-flex items-center rounded-md bg-[#9B7E5C] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#9B7E5C]/90"
            >
              {locale === 'de' ? 'Termin anfragen' : 'Request Appointment'}
            </Link>
          </div>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="bg-[#FAF8F5] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-widest text-[#9B7E5C]">
              {locale === 'de' ? 'Weitere Behandlungen' : 'More treatments'}
            </p>
            <h2 className="mt-3 text-2xl font-light text-[#3D3630]">
              {locale === 'de' ? 'Das könnte Sie auch interessieren' : 'You might also like'}
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
                  locale={locale}
                  slug={s.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </ZenPageShell>
  )
}
