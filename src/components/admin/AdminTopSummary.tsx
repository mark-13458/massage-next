type Props = {
  title: string
  items: Array<{ label: string; value: string | number; tone?: 'default' | 'accent' }>
}

export function AdminTopSummary({ title, items }: Props) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-4 ${item.tone === 'accent' ? 'border-amber-200 bg-amber-50' : 'border-stone-100 bg-stone-50'}`}
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
