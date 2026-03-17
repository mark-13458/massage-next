import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getHeroSettings } from '../../../server/services/site.service'

export async function ZenHero({ locale }: { locale: Locale }) {
  const t = getMessages(locale)
  const hero = await getHeroSettings(locale).catch(() => null)

  const imageUrl =
    hero?.imageUrl ||
    'https://images.unsplash.com/photo-1758523907012-7925a9793398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

  const title = (typeof hero?.title === 'string' && hero.title) ? hero.title : t.hero.title
  const subtitle = (typeof hero?.subtitle === 'string' && hero.subtitle) ? hero.subtitle : t.hero.subtitle

  return (
    <section className="relative flex h-[600px] items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={locale === 'de' ? 'Wellness Studio' : 'Wellness Studio'}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-light tracking-tight text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
          {subtitle}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={`/${locale}/booking`}
            className="inline-flex items-center justify-center rounded-md bg-[#9B7E5C] px-8 py-3 text-white transition-colors hover:bg-[#9B7E5C]/90"
          >
            {t.hero.primaryCta}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href={`/${locale}/services`}
            className="inline-flex items-center justify-center rounded-md bg-white/20 px-8 py-3 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            {t.hero.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  )
}
