import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { SectionShell } from '../../../components/site/SectionShell'
import { isLocale, Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { createPageMetadata } from '../../../lib/seo'
import { getActiveGallery, getSystemSettings } from '../../../server/services/site.service'

const fallbackGallery = [
  {
    id: 1,
    title: { de: 'Empfang & Ruhezone', en: 'Reception & calm lounge' },
    image: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 2,
    title: { de: 'Warme Behandlungsatmosphäre', en: 'Warm treatment atmosphere' },
    image: 'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 3,
    title: { de: 'Detail & Materialität', en: 'Details & materiality' },
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 4,
    title: { de: 'Wellness mit natürlicher Wärme', en: 'Wellness with natural warmth' },
    image: 'https://images.pexels.com/photos/3865557/pexels-photo-3865557.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 5,
    title: { de: 'Ruhige Lichtstimmung', en: 'Calm lighting mood' },
    image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: 6,
    title: { de: 'Pflege & Entspannung', en: 'Care & relaxation' },
    image: 'https://images.pexels.com/photos/5240677/pexels-photo-5240677.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
]

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) {
    return {}
  }

  const settings = await getSystemSettings().catch(() => null)

  return createPageMetadata({
    locale,
    pathname: '/gallery',
    title: locale === 'de' ? 'Galerie & Studio-Eindrücke' : 'Gallery & Studio Impressions',
    description:
      locale === 'de'
        ? settings?.seoMetaDescriptionDe || 'Sehen Sie Eindrücke aus dem Studio, der Atmosphäre und dem Wellness-Umfeld von China TCM Massage in München.'
        : settings?.seoMetaDescriptionEn || 'View impressions of the studio, atmosphere and wellness environment of China TCM Massage in Munich.',
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const t = getMessages(typedLocale)
  const gallery = await getActiveGallery(typedLocale).catch(() => [])
  const items = gallery.length > 0
    ? gallery.map((item) => ({ id: item.id, title: item.title || 'Gallery', image: item.imageUrl }))
    : fallbackGallery.map((item) => ({ id: item.id, title: item.title[typedLocale], image: item.image }))

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Studio Galerie' : 'Studio gallery'}
        title={t.nav.gallery}
        description={
          typedLocale === 'de'
            ? 'Einblicke in Studio, Atmosphäre und Details, die den ruhigen Charakter des Ortes sichtbar machen.'
            : 'A closer look at the studio, its atmosphere and the details that shape a calm wellness experience.'
        }
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <article
              key={item.id}
              className={`group overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-soft ${index % 3 === 0 ? 'xl:translate-y-6' : ''}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs uppercase tracking-[0.26em] text-amber-200">China TCM Massage</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight">{item.title}</h2>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 rounded-[2rem] border border-stone-200 bg-stone-950 p-8 text-center shadow-soft">
          <p className="text-lg font-semibold text-white">
            {typedLocale === 'de' ? 'Bereit für Ihren Besuch?' : 'Ready to visit us?'}
          </p>
          <p className="mt-2 text-sm text-stone-300">
            {typedLocale === 'de'
              ? 'Erleben Sie die Atmosphäre persönlich – fragen Sie jetzt Ihren Termin an.'
              : 'Experience the atmosphere in person – request your appointment now.'}
          </p>
          <Link
            href={`/${typedLocale}/booking`}
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-brown-900 transition hover:bg-stone-100"
          >
            {typedLocale === 'de' ? 'Termin anfragen' : 'Request appointment'}
          </Link>
        </div>
      </SectionShell>
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
