import { AdminLang, pick } from '../../lib/admin-i18n'

type Props = {
  title: string
  lang: AdminLang
  items: Array<{ labelZh: string; labelEn: string; value: string | number; tone?: 'default' | 'accent' }>
}

export function AdminTopSummary({ title, items, lang }: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(28,25,23,0.08)]">
      <div className="border-b border-stone-100 px-6 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, '总览', 'Overview')}</p>
            <h3 className="mt-2 text-lg font-semibold text-stone-900">{title}</h3>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-stone-100 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`bg-white px-6 py-6 sm:px-7 ${item.tone === 'accent' ? 'bg-[linear-gradient(180deg,#fff9ed_0%,#fff_100%)]' : ''}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, item.labelZh, item.labelEn)}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-tight text-stone-900">{item.value}</p>
              <div className={`h-2.5 w-2.5 rounded-full ${item.tone === 'accent' ? 'bg-amber-500' : 'bg-stone-300'}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
