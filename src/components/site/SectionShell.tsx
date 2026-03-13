export function SectionShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brown-900 sm:text-4xl">{title}</h2>
          {description ? <p className="mt-4 text-base leading-8 text-brown-700">{description}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}
