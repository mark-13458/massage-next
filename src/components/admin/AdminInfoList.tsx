type InfoItem = {
  label: string
  value: string
}

export function AdminInfoList({ items }: { items: InfoItem[] }) {
  return (
    <div className="grid gap-3 text-sm text-stone-700">
      {items.map((item) => (
        <div key={item.label}>
          <span className="font-semibold text-stone-900">{item.label}</span>
          {item.value}
        </div>
      ))}
    </div>
  )
}
