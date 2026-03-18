import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getActiveGallery } from '../../../server/services/site.service'
import { ZenPageShell } from './ZenPageShell'

const fallbackGallery = [
  { id: 1, title: { de: 'Empfang & Ruhezone', en: 'Reception & calm lounge' }, image: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: 2, title: { de: 'Warme Behandlungsatmosphäre', en: 'Warm treatment atmosphere' }, image: 'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: 3, title: { de: 'Detail & Materialität', en: 'Details & materiality' }, image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: 4, title: { de: 'Wellness mit natürlicher Wärme', en: 'Wellness with natural warmth' }, image: 'https://images.pexels.com/photos/3865557/pexels-photo-3865557.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: 5, title: { de: 'Ruhige Lichtstimmung', en: 'Calm lighting mood' }, image: 'https://images.pexels.com/photos/3997989/pexels-photo-3997989.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { id: 6, title: { de: 'Pflege & Entspannung', en: 'Care & relaxation' }, image: 'https://images.pexels.com/photos/5240677/pexels-photo-5240677.jpeg?auto=compress&cs=tinysrgb&w=1200' },
]

export async function ZenGalleryPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const gallery = await getActiveGallery(locale).catch(() => [])
  const items = gallery.length > 0
    ? gallery.map((item) => ({ id: item.id, title: item.title || 'Gallery', image: item.imageUrl }))
    : fallbackGallery.map((item) => ({ id: item.id, title: item.title[locale], image: item.image }))

  return (
    <ZenPageShell locale={locale}>
      {/* Hero */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B7E5C]">
            {locale === 'de' ? 'Studio Galerie' : 'Studio gallery'}
          </p>
          <h1 className="mt-3 text-4xl font-light text-[#3D3630] md:text-5xl">{t.nav.gallery}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#8C7D6F]">
            {locale === 'de'
              ? 'Einblicke in Studio, Atmosphäre und Details, die den ruhigen Charakter des Ortes sichtbar machen.'
              : 'A closer look at the studio, its atmosphere and the details that shape a calm wellness experience.'}
          </p>
        </div>
      </section>

      {/* Gallery grid */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="group overflow-hidden rounded-lg border border-[rgba(155,126,92,0.15)] bg-white shadow-sm">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D3630]/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h2 className="text-lg font-light leading-tight">{item.title}</h2>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-[#9B7E5C] p-8 text-center text-white">
            <p className="text-lg font-light">
              {locale === 'de' ? 'Bereit für Ihren Besuch?' : 'Ready to visit us?'}
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
