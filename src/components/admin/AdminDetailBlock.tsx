type Props = {
  title: string
  children: React.ReactNode
}

export function AdminDetailBlock({ title, children }: Props) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  )
}
