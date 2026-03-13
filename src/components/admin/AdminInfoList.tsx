type InfoItem = {
  label: string
  value: string
}

export function AdminInfoList({ items }: { items: InfoItem[] }) {
  return (
    <div className="grid gap-3 text-sm text-stone-700">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 leading-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{item.label}</div>
          <div className="mt-1 text-sm font-medium text-stone-900">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
