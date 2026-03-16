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

export function TestimonialList({ initialItems, lang }: { initialItems: Item[]; lang: AdminLang }) {
  const [items, setItems] = useState<Item[]>(initialItems)

  function handleDeleted(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function handleCreated(item: Item) {
    setItems((prev) => [item, ...prev])
  }

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

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-stone-500">
          {t(lang, '还没有评价，点击上方按钮新增。', 'No testimonials yet. Click the button above to add one.')}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <TestimonialRow key={item.id} item={item} lang={lang} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}
