'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
function t(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }

type NoticeTone = 'success' | 'error'

export function DeleteArticleButton({ id, lang = 'zh' }: { id: number; lang?: AdminLang }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [isPending, startTransition] = useTransition()

  async function remove() {
    if (!window.confirm(t(lang, '确认删除这篇文章吗？此操作不可撤销。', 'Delete this article? This cannot be undone.'))) return
    setMessage('')
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/articles/${id}`, { method: 'DELETE' })
        setMessage(t(lang, '已删除', 'Deleted'))
        setMessageTone('success')
        router.push('/admin/articles')
        router.refresh()
      } catch {
        setMessage(t(lang, '删除失败', 'Delete failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={remove} disabled={isPending} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70">
        {isPending ? t(lang, '删除中…', 'Deleting...') : t(lang, '删除文章', 'Delete article')}
      </button>
      {message ? <NoticePill message={message} tone={messageTone} className="text-xs" /> : null}
    </div>
  )
}
