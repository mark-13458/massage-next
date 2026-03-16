import Image from 'next/image'
import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getMessages } from '../../lib/copy'
import { getHeroSettings, getSystemSettings } from '../../server/services/site.service'

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const [hero, settings] = await Promise.all([
    getHeroSettings(locale).catch(() => null),
    getSystemSettings().catch(() => null),
  ])
  const siteName = settings?.siteName || 'China TCM Massage'

  const imageUrl =
    hero?.imageUrl ||
    'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200'

  const stats = [
    locale === 'de' ? ['7 Tage', 'Flexible Zeiten'] : ['7 days', 'Flexible hours'],
    locale === 'de' ? ['DE / EN / 中文', 'Mehrsprachig'] : ['DE / EN / 中文', 'Multilingual'],
    locale === 'de' ? ['Transparent', 'Preis & Dauer'] : ['Transparent', 'Price & duration'],
  ] as [string, string][]

  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-[#f7efe4] via-cream to-white">
      {/* Decorative blobs — hidden on mobile to reduce paint cost */}
      <div className="pointer-events-none absolute inset-0 hidden opacity-60 sm:block">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-brown-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 md:py-24 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-12">
          {/* Text column */}
          <div>
            <p className="inline-flex rounded-full border border-amber-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-amber-900 shadow-sm">
              {typeof hero?.eyebrow === 'string' && hero.eyebrow ? hero.eyebrow : t.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-3xl font-semibold leading-[1.08] text-brown-900 sm:text-4xl md:max-w-xl lg:text-5xl xl:text-6xl">
              {typeof hero?.title === 'string' && hero.title ? hero.title : t.hero.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-brown-700 sm:mt-6 sm:max-w-xl sm:text-lg sm:leading-8">
              {typeof hero?.subtitle === 'string' && hero.subtitle ? hero.subtitle : t.hero.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <Link
                href={`/${locale}/booking`}
                className="rounded-full bg-brown-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brown-800 sm:px-6 sm:py-3"
              >
                {t.hero.primaryCta}
              </Link>
              <Link
                href={`/${locale}/services`}
                className="rounded-full border border-brown-300 bg-white/90 px-5 py-2.5 text-sm font-medium text-brown-800 transition hover:border-brown-500 hover:bg-white sm:px-6 sm:py-3"
              >
                {t.hero.secondaryCta}
              </Link>
            </div>

            {/* Stats — horizontal scroll on mobile, grid on sm+ */}
            <div className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:max-w-xl sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {stats.map(([value, label]) => (
                <div
                  key={value}
                  className="min-w-[130px] flex-shrink-0 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur sm:min-w-0"
                >
                  <p className="text-base font-semibold text-brown-900 sm:text-lg">{value}</p>
                  <p className="mt-1 text-xs text-brown-600 sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-[0_28px_80px_rgba(121,85,72,0.16)]">
            <div className="relative aspect-[4/3] w-full sm:aspect-[3/4] md:aspect-[4/5]">
              <Image
                src={imageUrl}
                alt={locale === 'de' ? 'Entspannende Massageatmosphäre' : 'Relaxing massage atmosphere'}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-200">{siteName}</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-stone-100 sm:mt-3 sm:text-base sm:leading-7">
                {typeof hero?.note === 'string' && hero.note
                  ? hero.note
                  : locale === 'de'
                    ? 'Traditionelle Behandlungen in ruhiger, moderner Studioatmosphäre.'
                    : 'Traditional treatments in a calm, modern studio atmosphere.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
