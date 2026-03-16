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

export function ServiceCard({ name, summary, durationMin, price, featured, currency = 'EUR', locale = 'de', slug }: ServiceCardProps) {
  const currencySymbol = currency === 'EUR' ? '€' : currency

  const inner = (
    <article className="group flex h-full flex-col rounded-[2rem] border border-stone-200 bg-white p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(121,85,72,0.18)] sm:p-6">
      {featured ? (
        <div className="mb-3 inline-flex self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
          {locale === 'de' ? 'Empfohlen' : 'Featured'}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-brown-900 sm:text-xl">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-brown-700 sm:mt-3 sm:leading-7">{summary || '—'}</p>
      <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
        <span className="text-brown-600">{durationMin} min</span>
        <strong className="text-base font-semibold text-brown-900">{currencySymbol} {price}</strong>
      </div>
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
