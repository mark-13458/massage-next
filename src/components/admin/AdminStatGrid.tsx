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
          className={dark ? 'rounded-3xl border border-white/10 bg-white/5 p-4' : 'rounded-3xl border border-stone-100 bg-[linear-gradient(180deg,#fff_0%,#fcfbf9_100%)] p-4'}
        >
          <p className={dark ? 'text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400' : 'text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400'}>{item.label}</p>
          <p className={dark ? 'mt-3 text-3xl font-semibold text-white' : 'mt-3 text-3xl font-semibold text-stone-900'}>{item.value}</p>
        </div>
      ))}
    </div>
  )
}
