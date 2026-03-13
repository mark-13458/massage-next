type ServiceCardProps = {
  name: string
  summary?: string | null
  durationMin: number
  price: string
  featured?: boolean
  currency?: string
  locale?: 'de' | 'en'
}

export function ServiceCard({ name, summary, durationMin, price, featured, currency = 'EUR', locale = 'de' }: ServiceCardProps) {
  const currencySymbol = currency === 'EUR' ? '€' : currency

  return (
    <article className="group rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(121,85,72,0.18)]">
      {featured ? (
        <div className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-900">
          {locale === 'de' ? 'Empfohlen' : 'Featured'}
        </div>
      ) : null}
      <h3 className="text-xl font-semibold text-brown-900">{name}</h3>
      <p className="mt-3 min-h-[3rem] text-sm leading-7 text-brown-700">{summary || '—'}</p>
      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
        <span className="text-brown-600">{durationMin} min</span>
        <strong className="text-base text-brown-900">{currencySymbol} {price}</strong>
      </div>
    </article>
  )
}
