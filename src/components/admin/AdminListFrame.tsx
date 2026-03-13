type Props = {
  title: string
  description: string
  children: React.ReactNode
}

export function AdminListFrame({ title, description, children }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="border-b border-stone-100 px-6 py-5">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        <p className="mt-2 text-sm text-stone-600">{description}</p>
      </div>
      {children}
    </div>
  )
}
