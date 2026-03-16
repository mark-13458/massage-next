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
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-900 sm:px-4">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brown-900 sm:mt-4 sm:text-3xl lg:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-3 text-sm leading-7 text-brown-700 sm:mt-4 sm:text-base sm:leading-8">{description}</p>
          ) : null}
        </div>
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </section>
  )
}
