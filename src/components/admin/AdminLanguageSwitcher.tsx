'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type AdminLang = 'zh' | 'en'

export function AdminLanguageSwitcher({ currentLang }: { currentLang: AdminLang }) {
  const router = useRouter()
  const [lang, setLang] = useState<AdminLang>(currentLang)
  const [isPending, startTransition] = useTransition()

  function update(nextLang: AdminLang) {
    setLang(nextLang)
    startTransition(async () => {
      await fetch('/api/admin/preferences/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: nextLang }),
      }).catch(() => null)
      router.refresh()
    })
  }

  return (
    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white p-1 shadow-sm">
      {(['zh', 'en'] as const).map((item) => {
        const active = lang === item
        return (
          <button
            key={item}
            type="button"
            onClick={() => update(item)}
            disabled={isPending}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'} disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {item === 'zh' ? '中文' : 'English'}
          </button>
        )
      })}
    </div>
  )
}
