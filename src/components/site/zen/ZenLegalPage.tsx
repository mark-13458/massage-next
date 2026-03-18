import { Locale } from '../../../lib/i18n'
import { ZenPageShell } from './ZenPageShell'

interface Props {
  locale: Locale
  title: string
  eyebrow: string
  description: string
  children: React.ReactNode
}

export function ZenLegalPage({ locale, title, eyebrow, description, children }: Props) {
  return (
    <ZenPageShell locale={locale}>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B7E5C]">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-light text-[#3D3630] md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8C7D6F]">{description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-stone prose-lg mx-auto rounded-lg bg-white p-8 shadow-sm sm:p-12">
            {children}
          </div>
        </div>
      </section>
    </ZenPageShell>
  )
}
