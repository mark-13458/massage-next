'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'

type AdminLang = 'zh' | 'en'

const actionMap = {
  zh: [
    { label: '确认预约', status: 'CONFIRMED' },
    { label: '标记完成', status: 'COMPLETED' },
    { label: '标记取消', status: 'CANCELLED' },
    { label: '标记爽约', status: 'NO_SHOW' },
  ],
  en: [
    { label: 'Confirm booking', status: 'CONFIRMED' },
    { label: 'Mark completed', status: 'COMPLETED' },
    { label: 'Mark cancelled', status: 'CANCELLED' },
    { label: 'Mark no-show', status: 'NO_SHOW' },
  ],
} as const

type NoticeTone = 'success' | 'error' | 'info'

function noticeClassName(tone: NoticeTone) {
  if (tone === 'success') return 'text-emerald-700'
  if (tone === 'error') return 'text-rose-700'
  return 'text-stone-500'
}

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function AppointmentQuickActions({ id, lang = 'zh' }: { id: number; lang?: AdminLang }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [isPending, startTransition] = useTransition()

  function run(status: string) {
    setMessage(t(lang, '正在执行操作…', 'Running action...'))
    setMessageTone('info')
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        setMessage(t(lang, '操作成功，页面已刷新', 'Action succeeded and page refreshed'))
        setMessageTone('success')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '操作失败', 'Action failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actionMap[lang].map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => run(action.status)}
            disabled={isPending}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {action.label}
          </button>
        ))}
      </div>
      {message ? <p className={`text-xs ${noticeClassName(messageTone)}`}>{message}</p> : null}
    </div>
  )
}
