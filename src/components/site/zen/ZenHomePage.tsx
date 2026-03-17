import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Award, Clock, Shield, Star } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import {
  getActiveServices,
  getPublishedTestimonials,
  getActiveFaqs,
  getBusinessHours,
  getContactSettings,
  getSystemSettings,
} from '../../../server/services/site.service'
import { ZenHeader } from './ZenHeader'
import { ZenHero } from './ZenHero'
import { ZenFooter } from './ZenFooter'
import { FloatingActions } from '../FloatingActions'

export async function ZenHomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const [services, testimonials, faqs, hours, contact, settings] = await Promise.all([
    getActiveServices(locale).catch(() => []),
    getPublishedTestimonials(locale).catch(() => []),
    getActiveFaqs(locale).catch(() => []),
    getBusinessHours(locale).catch(() => []),
    getContactSettings().catch(() => null),
    getSystemSettings().catch(() => null),
  ])

  const siteName = settings?.siteName || 'Zen Oase'
  const currency = settings?.currency || 'EUR'

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/gallery`, label: t.nav.gallery },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ]

  const trustFeatures = [
    {
      icon: Award,
      title: locale === 'de' ? 'Zertifizierte Therapeuten' : 'Certified Therapists',
      desc: locale === 'de' ? 'Alle Therapeuten sind professionell ausgebildet und zertifiziert.' : 'All therapists are professionally trained and certified.',
    },
    {
      icon: Clock,
      title: locale === 'de' ? '10+ Jahre Erfahrung' : '10+ Years Experience',
      desc: locale === 'de' ? 'Über ein Jahrzehnt Erfahrung in Wellness und Massage.' : 'Over a decade of experience in wellness and massage.',
    },
    {
      icon: Shield,
      title: locale === 'de' ? 'Höchste Hygienestandards' : 'Highest Hygiene Standards',
      desc: locale === 'de' ? 'Strenge Hygieneprotokolle für Ihre Sicherheit.' : 'Strict hygiene protocols for your safety.',
    },
    {
      icon: Star,
      title: locale === 'de' ? '100% Zufriedenheit' : '100% Satisfaction',
      desc: locale === 'de' ? 'Ihre Zufriedenheit ist unsere oberste Priorität.' : 'Your satisfaction is our top priority.',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#3D3630]">
      <ZenHeader locale={locale} siteName={siteName} navLinks={navLinks} bookingLabel={t.nav.booking} />

      <main className="flex-1 pb-24 sm:pb-0">
        <ZenHero locale={locale} />

        {/* Trust Features */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-light text-[#3D3630] md:text-4xl">
              {locale === 'de' ? 'Warum Zen Oase?' : 'Why Zen Oase?'}
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {trustFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#9B7E5C]/10">
                    <feature.icon className="h-8 w-8 text-[#9B7E5C]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[#3D3630]">{feature.title}</h3>
                  <p className="text-sm text-[#8C7D6F]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="bg-[#FAF8F5] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-light text-[#3D3630] md:text-4xl">{t.sections.featuredServices}</h2>
              <p className="mx-auto max-w-2xl text-lg text-[#8C7D6F]">
                {locale === 'de'
                  ? 'Ausgewählte Behandlungen mit klarer Dauer und transparenter Preisstruktur.'
                  : 'Selected treatments with clear durations and transparent pricing.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {services.slice(0, 3).map((service) => (
                <div key={service.id} className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-[#E8DFD4]">
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl">🌿</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-light text-[#3D3630]">{service.name}</h3>
                    <p className="mb-4 text-sm text-[#8C7D6F]">{service.summary}</p>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-[#8C7D6F]">{service.durationMin} min</span>
                      <span className="text-lg font-semibold text-[#9B7E5C]">
                        {currency === 'EUR' ? '€' : currency}{Number(service.price).toFixed(0)}
                      </span>
                    </div>
                    <Link
                      href={`/${locale}/booking`}
                      className="block w-full rounded-md bg-[#9B7E5C] px-4 py-2 text-center text-sm text-white transition-colors hover:bg-[#9B7E5C]/90"
                    >
                      {locale === 'de' ? 'Jetzt buchen' : 'Book now'}
                    </Link>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-full rounded-lg bg-white p-10 text-center shadow-sm">
                  <p className="text-sm text-[#8C7D6F]">
                    {locale === 'de' ? 'Behandlungen werden in Kürze veröffentlicht.' : 'Treatments will be published shortly.'}
                  </p>
                </div>
              )}
            </div>

            {services.length > 0 && (
              <div className="mt-12 text-center">
                <Link href={`/${locale}/services`} className="inline-flex items-center text-[#9B7E5C] transition-colors hover:text-[#9B7E5C]/80">
                  {locale === 'de' ? 'Alle Behandlungen' : 'All services'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-[#FAF8F5] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-12 text-center text-3xl font-light text-[#3D3630] md:text-4xl">{t.sections.testimonials}</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.id} className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="mb-4 flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < (item.rating ?? 5) ? 'fill-[#9B7E5C] text-[#9B7E5C]' : 'text-[#E8DFD4]'}`}
                      />
                    ))}
                  </div>
                  <p className="mb-4 italic text-[#8C7D6F]">"{item.content}"</p>
                  <p className="font-semibold text-[#3D3630]">— {item.customerName}</p>
                </div>
              ))}
              {testimonials.length === 0 && (
                <div className="col-span-full rounded-lg bg-white p-10 text-center shadow-sm">
                  <div className="mb-3 flex justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#9B7E5C] text-[#9B7E5C]" />
                    ))}
                  </div>
                  <p className="text-sm text-[#8C7D6F]">
                    {locale === 'de' ? 'Gästestimmen werden in Kürze veröffentlicht.' : 'Guest reviews will be published shortly.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Hours & Contact */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-lg border border-[rgba(155,126,92,0.15)] bg-[#FAF8F5] p-8">
                <h3 className="mb-6 text-xl font-semibold text-[#3D3630]">
                  {locale === 'de' ? 'Öffnungszeiten' : 'Opening hours'}
                </h3>
                <div className="divide-y divide-[rgba(155,126,92,0.1)]">
                  {hours.length > 0 ? hours.map((item) => (
                    <div key={item.weekday} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-[#3D3630]">{item.label}</span>
                      <span className={item.isClosed ? 'text-[#8C7D6F]' : 'text-[#3D3630]'}>
                        {item.isClosed ? (locale === 'de' ? 'Geschlossen' : 'Closed') : `${item.openTime} – ${item.closeTime}`}
                      </span>
                    </div>
                  )) : (
                    <p className="py-4 text-sm text-[#8C7D6F]">Mo–Sa 09:30–20:00</p>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-[#9B7E5C] p-8 text-white">
                <h3 className="mb-6 text-xl font-semibold">{locale === 'de' ? 'Kontakt' : 'Contact'}</h3>
                <div className="space-y-4 text-sm leading-7 text-white/80">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{locale === 'de' ? 'Adresse' : 'Address'}</p>
                    <p className="mt-1">{contact?.address ?? 'Arnulfstraße 104, 80636 München'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50">{locale === 'de' ? 'Telefon' : 'Phone'}</p>
                    <a href={`tel:${(contact?.phone ?? '015563188800').replace(/\s/g, '')}`} className="mt-1 block transition hover:text-white">
                      {contact?.phone ?? '015563 188800'}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50">E-Mail</p>
                    <a href={`mailto:${contact?.email ?? 'chinesischemassage8@gmail.com'}`} className="mt-1 block break-all transition hover:text-white">
                      {contact?.email ?? 'chinesischemassage8@gmail.com'}
                    </a>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href={`/${locale}/booking`} className="inline-flex rounded-md bg-white px-5 py-2.5 text-sm font-medium text-[#9B7E5C] transition hover:bg-white/90">
                    {locale === 'de' ? 'Termin anfragen' : 'Request appointment'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        {faqs.length > 0 && (
          <section className="bg-[#FAF8F5] py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="mb-12 text-center text-3xl font-light text-[#3D3630] md:text-4xl">{t.sections.faq}</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {faqs.map((faq) => (
                  <div key={faq.id} className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-2 font-semibold text-[#3D3630]">{faq.question}</h3>
                    <p className="text-sm leading-7 text-[#8C7D6F]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#9B7E5C] py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-light md:text-4xl">{t.hero.primaryCta}</h2>
            <p className="mb-8 text-lg opacity-90">{t.hero.subtitle}</p>
            <Link
              href={`/${locale}/booking`}
              className="inline-flex items-center rounded-md bg-white px-8 py-3 text-[#9B7E5C] transition-colors hover:bg-white/90"
            >
              {t.nav.booking}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <FloatingActions locale={locale} />
      </main>

      <ZenFooter locale={locale} />
    </div>
  )
}
