import Link from 'next/link'
import { Locale } from '../../lib/i18n'
import { getMessages } from '../../lib/copy'
import { getHeroSettings } from '../../server/services/site.service'

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const hero = await getHeroSettings(locale).catch(() => null)

  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-[#f7efe4] via-cream to-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-amber-200/60 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-80 w-80 rounded-full bg-brown-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24 lg:px-8">
        <div>
          <p className="inline-flex rounded-full border border-amber-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-amber-900 shadow-sm">
            {typeof hero?.eyebrow === 'string' && hero.eyebrow ? hero.eyebrow : t.hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.05] text-brown-900 sm:text-5xl lg:text-6xl">
            {typeof hero?.title === 'string' && hero.title ? hero.title : t.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-brown-700 sm:text-lg">
            {typeof hero?.subtitle === 'string' && hero.subtitle ? hero.subtitle : t.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={`/${locale}/booking`}
              className="rounded-full bg-brown-900 px-6 py-3 text-sm font-medium text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brown-800"
            >
              {t.hero.primaryCta}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="rounded-full border border-brown-300 bg-white/90 px-6 py-3 text-sm font-medium text-brown-800 transition hover:border-brown-500 hover:bg-white"
            >
              {t.hero.secondaryCta}
            </Link>
          </div>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            {[
              locale === 'de' ? ['7 Tage', 'Flexible Zeiten'] : ['7 days', 'Flexible hours'],
              locale === 'de' ? ['DE / EN / 中文', 'Mehrsprachig'] : ['DE / EN / 中文', 'Multilingual'],
              locale === 'de' ? ['Transparent', 'Preis & Dauer'] : ['Transparent', 'Price & duration'],
            ].map(([value, label]) => (
              <div key={value} className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
                <p className="text-lg font-semibold text-brown-900">{value}</p>
                <p className="mt-1 text-sm text-brown-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-[0_28px_80px_rgba(121,85,72,0.16)]">
          <img
            src={hero?.imageUrl || 'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200'}
            alt={locale === 'de' ? 'Entspannende Massageatmosphäre' : 'Relaxing massage atmosphere'}
            className="h-full min-h-[360px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/55 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-amber-200">China TCM Massage</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-stone-100 sm:text-base">
              {typeof hero?.note === 'string' && hero.note
                ? hero.note
                : locale === 'de'
                  ? 'Ein ruhiger, warmer und professioneller Markenauftritt für Studio, Gäste und Terminbuchung.'
                  : 'A calm, warm and professional brand presence for the studio, its guests and the booking flow.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
