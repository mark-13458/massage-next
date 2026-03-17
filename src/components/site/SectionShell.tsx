export function SectionShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${className ?? ''}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="eyebrow">
              <span className="inline-block h-1 w-5 rounded-full bg-amber-400" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-brown-900 sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 font-sans text-sm leading-7 text-brown-600 sm:mt-4 sm:text-base sm:leading-8">
              {description}
            </p>
          ) : null}
        </div>
        <div className="mt-10 sm:mt-12">{children}</div>
      </div>
    </section>
  )
}
