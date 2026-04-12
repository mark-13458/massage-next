'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
function t(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }
type NoticeTone = 'success' | 'error'

export function TagManager({ lang = 'zh' }: { lang?: AdminLang }) {
  const router = useRouter()
  const [nameDe, setNameDe] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [isPending, startTransition] = useTransition()

  async function submit() {
    if (!nameDe.trim() || !nameEn.trim()) return
    setMessage('')
    startTransition(async () => {
      try {
        await adminRequest('/api/admin/article-tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameDe: nameDe.trim(), nameEn: nameEn.trim() }),
        })
        setMessage(t(lang, '标签已创建', 'Tag created'))
        setMessageTone('success')
        setNameDe('')
        setNameEn('')
        router.refresh()
      } catch {
        setMessage(t(lang, '创建失败', 'Create failed'))
        setMessageTone('error')
      }
    })
  }

  const inputCls = 'w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500'

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-2 text-sm text-stone-700">
        <span>{t(lang, '标签名（德语）', 'Name (DE)')}</span>
        <input value={nameDe} onChange={(e) => setNameDe(e.target.value)} placeholder="z.B. Rückenmassage" className={inputCls} />
      </label>
      <label className="flex flex-col gap-2 text-sm text-stone-700">
        <span>{t(lang, '标签名（英语）', 'Name (EN)')}</span>
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Back massage" className={inputCls} />
      </label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '创建中…', 'Creating...') : t(lang, '创建标签', 'Create tag')}
        </button>
        {message ? <NoticePill message={message} tone={messageTone} /> : null}
      </div>
    </div>
  )
}
