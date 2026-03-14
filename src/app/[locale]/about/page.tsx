import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { SectionShell } from '../../../components/site/SectionShell'
import { isLocale, Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { createPageMetadata } from '../../../lib/seo'
import { getActiveFaqs, getPublishedTestimonials, getSystemSettings } from '../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const settings = await getSystemSettings().catch(() => null)

  return createPageMetadata({
    locale,
    pathname: '/about',
    title: locale === 'de' ? 'Über unser Studio' : 'About Our Studio',
    description:
      locale === 'de'
        ? settings?.seoMetaDescriptionDe || 'Erfahren Sie mehr über die Haltung, Atmosphäre und Behandlungsphilosophie von China TCM Massage in München.'
        : settings?.seoMetaDescriptionEn || 'Learn more about the approach, atmosphere and treatment philosophy behind China TCM Massage in Munich.',
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const [faqs, testimonials] = await Promise.all([
    getActiveFaqs(typedLocale).catch(() => []),
    getPublishedTestimonials(typedLocale).catch(() => []),
  ])

  return (
    <main>
      <SiteHeader locale={typedLocale} />

      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Über uns' : 'About us'}
        title={t.nav.about}
        description={
          typedLocale === 'de'
            ? 'China TCM Massage verbindet traditionelle Anwendungen mit einer modernen, ruhigen Studioatmosphäre. Ziel ist kein hektischer Massensalon, sondern ein klarer, vertrauenswürdiger Ort für Entspannung und regelmäßige Regeneration.'
            : 'China TCM Massage combines traditional treatments with a calm, modern studio atmosphere. The goal is not a rushed salon experience, but a clear, trustworthy place for relaxation and regular recovery.'
        }
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-brown-900">
              {typedLocale === 'de' ? 'Unsere Haltung' : 'Our approach'}
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-brown-700">
              <p>
                {typedLocale === 'de'
                  ? 'Wir bauen diese Website bewusst mit klarer Struktur: verständliche Leistungen, transparente Preise, einfache Kontaktwege und eine angenehme Markenwirkung.'
                  : 'We are intentionally building this website with clarity: understandable services, transparent pricing, simple contact paths and a polished brand experience.'}
              </p>
              <p>
                {typedLocale === 'de'
                  ? 'Langfristig soll daraus ein kleines, aber sehr brauchbares Betreiber-System entstehen: mit Buchungen, Inhalten, Bildern, Öffnungszeiten und SEO-Pflege in einem chinesischsprachigen Backend.'
                  : 'Over time this will become a compact but practical operating system for the studio: bookings, content, imagery, opening hours and SEO maintenance inside a Chinese-language admin backend.'}
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-stone-200 bg-stone-950 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-white">
              {typedLocale === 'de' ? 'Warum Gäste wiederkommen' : 'Why guests come back'}
            </h2>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
              <li>• {typedLocale === 'de' ? 'Ruhige Atmosphäre statt hektischer Abfertigung' : 'A calm atmosphere instead of a rushed workflow'}</li>
              <li>• {typedLocale === 'de' ? 'Klare Kommunikation vor und nach dem Termin' : 'Clear communication before and after the appointment'}</li>
              <li>• {typedLocale === 'de' ? 'Leicht verständliche Leistungen mit transparenter Dauer und Preis' : 'Easy-to-understand treatments with transparent duration and pricing'}</li>
              <li>• {typedLocale === 'de' ? 'Ein moderner Markenauftritt, der professionell wirkt' : 'A modern brand presence that feels professional and trustworthy'}</li>
            </ul>
          </article>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Fragen & Antworten' : 'Questions & answers'}
        title={t.sections.faq}
        description={
          typedLocale === 'de'
            ? 'Antworten auf häufige Fragen rund um Behandlungen, Terminwünsche und den Ablauf vor Ort.'
            : 'Answers to common questions about treatments, appointment requests and what to expect on site.'
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brown-900">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-brown-700">{faq.answer}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Vertrauen' : 'Trust'}
        title={t.sections.testimonials}
        description={
          typedLocale === 'de'
            ? 'Vertrauen entsteht durch konsistente Qualität, ruhige Abläufe und positive Rückmeldungen von Gästen.'
            : 'Trust grows through consistent quality, calm processes and positive guest feedback.'
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-base leading-7 text-brown-800">“{item.content}”</p>
              <p className="mt-4 text-sm font-semibold text-brown-600">— {item.customerName}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SiteFooter locale={typedLocale} />
    </main>
  )
}
