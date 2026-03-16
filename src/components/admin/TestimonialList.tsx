'use client'

import { useState } from 'react'
import { TestimonialRow, TestimonialCreateForm } from './TestimonialControls'

type AdminLang = 'zh' | 'en'
function t(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }

type Item = {
  id: number
  customerName: string
  locale: string
  rating: number
  content: string
  sortOrder: number
  isPublished: boolean
}

type LocaleFilter = 'all' | 'de' | 'en'
type PublishFilter = 'all' | 'published' | 'unpublished'

export function TestimonialList({ initialItems, lang }: { initialItems: Item[]; lang: AdminLang }) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [localeFilter, setLocaleFilter] = useState<LocaleFilter>('all')
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all')

  function handleDeleted(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleCreated(item: Item) {
    setItems((prev) => [item, ...prev])
  }

  const filtered = items.filter((i) => {
    if (localeFilter !== 'all' && i.locale !== localeFilter) return false
    if (publishFilter === 'published' && !i.isPublished) return false
    if (publishFilter === 'unpublished' && i.isPublished) return false
    return true
  })

  const published = items.filter((i) => i.isPublished).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
            {t(lang, `共 ${items.length} 条`, `Total: ${items.length}`)}
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
            {t(lang, `已发布 ${published} 条`, `Published: ${published}`)}
          </span>
        </div>
        <TestimonialCreateForm lang={lang} onCreated={handleCreated} />
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-stone-500">{t(lang, '语言：', 'Locale:')}</span>
        {(['all', 'de', 'en'] as LocaleFilter[]).map((v) => (
          <button
            key={v}
            onClick={() => setLocaleFilter(v)}
            className={`rounded-full px-3 py-1 font-medium transition ${localeFilter === v ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
          >
            {v === 'all' ? t(lang, '全部', 'All') : v.toUpperCase()}
          </button>
        ))}
        <span className="ml-3 text-stone-500">{t(lang, '状态：', 'Status:')}</span>
        {([
          { v: 'all', zh: '全部', en: 'All' },
          { v: 'published', zh: '已发布', en: 'Published' },
          { v: 'unpublished', zh: '未发布', en: 'Unpublished' },
        ] as { v: PublishFilter; zh: string; en: string }[]).map(({ v, zh, en }) => (
          <button
            key={v}
            onClick={() => setPublishFilter(v)}
            className={`rounded-full px-3 py-1 font-medium transition ${publishFilter === v ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
          >
            {t(lang, zh, en)}
          </button>
        ))}
        {(localeFilter !== 'all' || publishFilter !== 'all') && (
          <span className="ml-2 rounded-full bg-stone-100 px-3 py-1 text-stone-600">
            {t(lang, `筛选结果 ${filtered.length} 条`, `Filtered: ${filtered.length}`)}
          </span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          {t(lang, '没有符合条件的评价。', 'No testimonials match the current filter.')}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <TestimonialRow key={item.id} item={item} lang={lang} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}
