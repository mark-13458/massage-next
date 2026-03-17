import Link from 'next/link'

type ServiceCardProps = {
  name: string
  summary?: string | null
  durationMin: number
  price: string
  featured?: boolean
  currency?: string
  locale?: 'de' | 'en'
  slug?: string
}

export function ServiceCard({
  name,
  summary,
  durationMin,
  price,
  featured,
  currency = 'EUR',
  locale = 'de',
  slug,
}: ServiceCardProps) {
  const currencySymbol = currency === 'EUR' ? '€' : currency

  const inner = (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brown-200 hover:shadow-card-hover sm:p-6">
      {/* Top accent line on hover */}
      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 rounded-t-[2rem] bg-gradient-to-r from-amber-300 to-brown-400 transition-transform duration-300 group-hover:scale-x-100" />

      {featured ? (
        <div className="mb-3 inline-flex self-start items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          {locale === 'de' ? 'Empfohlen' : 'Featured'}
        </div>
      ) : null}

      <h3 className="text-lg font-semibold text-brown-900 transition-colors group-hover:text-brown-700 sm:text-xl">
        {name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-brown-600 sm:mt-3 sm:leading-7">
        {summary || '—'}
      </p>

      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
        <span className="flex items-center gap-1.5 text-sm text-brown-500">
          <svg className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" d="M12 6v6l4 2" />
          </svg>
          {durationMin} min
        </span>
        <strong className="text-base font-semibold text-brown-900">
          {currencySymbol} {price}
        </strong>
      </div>

      {slug ? (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-brown-500 transition-colors group-hover:text-brown-700">
          {locale === 'de' ? 'Details ansehen' : 'View details'}
          <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ) : null}
    </article>
  )

  if (slug) {
    return (
      <Link href={`/${locale}/services/${slug}`} className="block h-full">
        {inner}
      </Link>
    )
  }

  return inner
}
