import Link from 'next/link'
import { Star, ArrowRight } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getActiveFaqs, getPublishedTestimonials } from '../../../server/services/site.service'
import { ZenPageShell } from './ZenPageShell'

export async function ZenAboutPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const [faqs, testimonials] = await Promise.all([
    getActiveFaqs(locale).catch(() => []),
    getPublishedTestimonials(locale).catch(() => []),
  ])

  return (
    <ZenPageShell locale={locale}>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B7E5C]">
            {locale === 'de' ? 'Über uns' : 'About us'}
          </p>
          <h1 className="mt-3 text-4xl font-light text-[#3D3630] md:text-5xl">{t.nav.about}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8C7D6F]">
            {locale === 'de'
              ? 'China TCM Massage verbindet traditionelle Anwendungen mit einer modernen, ruhigen Studioatmosphäre.'
              : 'China TCM Massage combines traditional treatments with a calm, modern studio atmosphere.'}
          </p>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-light text-[#3D3630]">
                {locale === 'de' ? 'Unsere Haltung' : 'Our approach'}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[#8C7D6F]">
                <p>
                  {locale === 'de'
                    ? 'Wir legen Wert auf klare Strukturen: verständliche Leistungen, transparente Preise, einfache Kontaktwege und eine angenehme Atmosphäre, die Vertrauen schafft.'
                    : 'We value clarity: understandable services, transparent pricing, simple contact paths and a welcoming atmosphere that builds trust.'}
                </p>
                <p>
                  {locale === 'de'
                    ? 'Jede Behandlung wird individuell abgestimmt. Unser Ziel ist nicht Quantität, sondern nachhaltige Qualität und das Wohlbefinden unserer Gäste.'
                    : 'Every treatment is individually tailored. Our goal is not quantity, but lasting quality and the wellbeing of our guests.'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-[#9B7E5C] p-8 text-white shadow-sm">
              <h2 className="text-2xl font-light">
                {locale === 'de' ? 'Warum Gäste wiederkommen' : 'Why guests come back'}
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-white/80">
                {[
                  locale === 'de' ? 'Ruhige Atmosphäre statt hektischer Abfertigung' : 'A calm atmosphere instead of a rushed workflow',
                  locale === 'de' ? 'Klare Kommunikation vor und nach dem Termin' : 'Clear communication before and after the appointment',
                  locale === 'de' ? 'Leicht verständliche Leistungen mit transparenter Dauer und Preis' : 'Easy-to-understand treatments with transparent duration and pricing',
                  locale === 'de' ? 'Ein moderner Markenauftritt, der professionell wirkt' : 'A modern brand presence that feels professional and trustworthy',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-light text-[#3D3630]">{t.sections.faq}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-lg bg-[#FAF8F5] p-6 shadow-sm">
                <h3 className="mb-2 font-semibold text-[#3D3630]">{faq.question}</h3>
                <p className="text-sm leading-7 text-[#8C7D6F]">{faq.answer}</p>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="col-span-full rounded-lg bg-[#FAF8F5] p-8 shadow-sm">
                <h3 className="font-semibold text-[#3D3630]">
                  {locale === 'de' ? 'Wie läuft eine Behandlung ab?' : 'What does a treatment session look like?'}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#8C7D6F]">
                  {locale === 'de'
                    ? 'Nach Ihrer Terminanfrage meldet sich das Studio zur Bestätigung. Bitte kommen Sie pünktlich und tragen Sie bequeme Kleidung.'
                    : 'After your booking request, the studio will confirm your appointment. Please arrive on time and wear comfortable clothing.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-light text-[#3D3630]">{t.sections.testimonials}</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.id} className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4 flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < (item.rating ?? 5) ? 'fill-[#9B7E5C] text-[#9B7E5C]' : 'text-[#E8DFD4]'}`} />
                  ))}
                </div>
                <p className="mb-4 italic text-sm text-[#8C7D6F]">"{item.content}"</p>
                <p className="font-semibold text-[#3D3630]">— {item.customerName}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-[#9B7E5C] p-8 text-center text-white">
            <p className="text-lg font-light">
              {locale === 'de' ? 'Überzeugt? Jetzt Termin anfragen.' : 'Convinced? Request your appointment now.'}
            </p>
            <Link
              href={`/${locale}/booking`}
              className="mt-6 inline-flex items-center rounded-md bg-white px-6 py-2.5 text-sm font-medium text-[#9B7E5C] transition hover:bg-white/90"
            >
              {locale === 'de' ? 'Termin anfragen' : 'Request appointment'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </ZenPageShell>
  )
}
