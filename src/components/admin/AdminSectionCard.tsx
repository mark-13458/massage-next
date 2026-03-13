type Props = {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  tone?: 'default' | 'dark'
}

export function AdminSectionCard({ eyebrow, title, description, children, actions, tone = 'default' }: Props) {
  if (tone === 'dark') {
    return (
      <section className="rounded-[28px] border border-stone-800 bg-[#201a17] p-6 text-stone-100 shadow-[0_18px_50px_rgba(28,25,23,0.18)] sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">{eyebrow}</p> : null}
            <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-300">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        <div className="mt-6">{children}</div>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(28,25,23,0.08)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{eyebrow}</p> : null}
          <h2 className="mt-2 text-lg font-semibold text-stone-900">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}
