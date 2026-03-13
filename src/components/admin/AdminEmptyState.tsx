export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50/80 px-6 py-12 text-center sm:px-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">Empty State</p>
      <h3 className="mt-3 text-lg font-semibold text-stone-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">{description}</p>
    </div>
  )
}
