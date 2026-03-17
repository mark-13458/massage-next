type StatItem = {
  label: string
  value: string | number
}

export function AdminStatGrid({ items, dark = false }: { items: StatItem[]; dark?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={dark
            ? 'rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/8'
            : 'rounded-3xl border border-stone-100 bg-[linear-gradient(160deg,#fff_0%,#faf8f5_100%)] p-5 shadow-sm transition hover:border-stone-200 hover:shadow'}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{item.label}</p>
          <p className={`mt-3 text-3xl font-semibold tabular-nums ${dark ? 'text-white' : 'text-stone-900'}`}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
