'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
function t(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }
type NoticeTone = 'success' | 'error'

export function KeywordImport({ lang = 'zh' }: { lang?: AdminLang }) {
  const router = useRouter()
  const [keywords, setKeywords] = useState('')
  const [locale, setLocale] = useState('de')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [isPending, startTransition] = useTransition()

  async function submit() {
    if (!keywords.trim()) return
    setMessage('')
    startTransition(async () => {
      try {
        const result = await adminRequest<{ count: number }>('/api/admin/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords, locale }),
        })
        setMessage(t(lang, `成功导入 ${result?.count ?? 0} 个关键词`, `Imported ${result?.count ?? 0} keywords`))
        setMessageTone('success')
        setKeywords('')
        router.refresh()
      } catch {
        setMessage(t(lang, '导入失败', 'Import failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <span>{t(lang, '语言', 'Locale')}</span>
          <select value={locale} onChange={(e) => setLocale(e.target.value)} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500">
            <option value="de">Deutsch (DE)</option>
            <option value="en">English (EN)</option>
          </select>
        </label>
      </div>
      <textarea
        rows={10}
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder={t(lang, '每行一个关键词，例如：\nRückenmassage München\nFußmassage Vorteile\nTCM Massage Therapie', 'One keyword per line, e.g.:\nRückenmassage München\nFußmassage Vorteile\nTCM Massage Therapie')}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '导入中…', 'Importing...') : t(lang, '批量导入', 'Import')}
        </button>
        {message ? <NoticePill message={message} tone={messageTone} /> : null}
      </div>
      <p className="text-xs leading-6 text-stone-400">
        {t(lang, '提示：导入后关键词默认为"待用"状态。AI 定时任务会每天取一个生成文章。', 'Imported keywords default to "Pending". The AI cron task picks one daily for generation.')}
      </p>
    </div>
  )
}
