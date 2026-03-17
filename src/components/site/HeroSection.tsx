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
    <section className="relative overflow-hidden border-b border-stone-200/50 bg-gradient-to-b from-warm-100 via-warm-50 to-[#fdfaf6]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 hidden opacity-60 sm:block" aria-hidden="true">
        <div className="absolute left-[-12rem] top-[-10rem] h-96 w-96 rounded-full bg-amber-200/40 blur-[100px]" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-brown-200/25 blur-[120px]" />
        <div className="absolute right-[28%] top-[15%] h-56 w-56 rounded-full bg-amber-100/35 blur-[70px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 md:py-28 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-16">
          {/* Text column */}
          <div>
            <p className="eyebrow">
              <span className="inline-block h-1 w-5 rounded-full bg-amber-400" aria-hidden="true" />
              {typeof hero?.eyebrow === 'string' && hero.eyebrow ? hero.eyebrow : t.hero.eyebrow}
            </p>

            <h1 className="mt-5 font-serif text-3xl font-semibold leading-[1.1] tracking-tight text-brown-900 sm:text-4xl md:max-w-xl lg:text-5xl xl:text-[3.4rem]">
              {typeof hero?.title === 'string' && hero.title ? hero.title : t.hero.title}
            </h1>

            <p className="mt-5 font-sans text-base leading-7 text-brown-600 sm:mt-6 sm:max-w-xl sm:text-lg sm:leading-8">
              {typeof hero?.subtitle === 'string' && hero.subtitle ? hero.subtitle : t.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/${locale}/booking`} className="btn-primary">
                {t.hero.primaryCta}
              </Link>
              <Link href={`/${locale}/services`} className="btn-ghost">
                {t.hero.secondaryCta}
              </Link>
            </div>

            {/* Stats */}
            <div className="-mx-4 mt-10 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:max-w-xl sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {stats.map(([value, label]) => (
                <div
                  key={value}
                  className="min-w-[130px] flex-shrink-0 rounded-2xl border border-amber-100/60 bg-white/80 p-4 shadow-card backdrop-blur sm:min-w-0"
                >
                  <p className="font-serif text-base font-semibold text-brown-900 sm:text-lg">{value}</p>
                  <p className="mt-0.5 font-sans text-xs text-brown-500 sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-100/60 bg-white shadow-[0_32px_80px_rgba(121,85,72,0.18)]">
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
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-stone-950/10 to-transparent" aria-hidden="true" />
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300">{siteName}</p>
              <p className="mt-2 max-w-md font-sans text-sm leading-6 text-stone-200 sm:mt-2.5 sm:text-base sm:leading-7">
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
