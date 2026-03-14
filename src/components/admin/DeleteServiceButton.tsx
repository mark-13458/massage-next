'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

type NoticeTone = 'success' | 'error'

export function DeleteServiceButton({ id, lang = 'zh' }: { id: number; lang?: AdminLang }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [isPending, startTransition] = useTransition()

  async function remove() {
    const ok = window.confirm(t(lang, '确认删除这个服务吗？此操作不可撤销。', 'Are you sure you want to delete this service? This action cannot be undone.'))
    if (!ok) return

    setMessage('')
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/services/${id}`, {
          method: 'DELETE',
        })

        setMessage(t(lang, '已删除', 'Deleted'))
        setMessageTone('success')
        router.push('/admin/services')
        router.refresh()
      } catch {
        setMessage(t(lang, '删除失败', 'Delete failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={remove}
        disabled={isPending}
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? t(lang, '删除中…', 'Deleting...') : t(lang, '删除服务', 'Delete service')}
      </button>
      {message ? <NoticePill message={message} tone={messageTone} className="text-xs" /> : null}
    </div>
  )
}
