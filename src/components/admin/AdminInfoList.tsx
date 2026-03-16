type LinkValue = { href: string; text: string }
type InfoValue = string | LinkValue | LinkValue[]

type InfoItem = {
  label: string
  value: InfoValue
}

export function AdminInfoList({ items }: { items: InfoItem[] }) {
  return (
    <div className="grid gap-3 text-sm text-stone-700">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 leading-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">{item.label}</div>
          <div className="mt-1 text-sm font-medium text-stone-900">
            {Array.isArray(item.value) ? (
              <div className="space-y-1">
                {item.value.map((v) => (
                  <div key={v.href}>
                    <a href={v.href} className="hover:text-brown-700 transition">{v.text}</a>
                  </div>
                ))}
              </div>
            ) : typeof item.value === 'object' ? (
              <a href={item.value.href} className="hover:text-brown-700 transition">{item.value.text}</a>
            ) : (
              item.value
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
