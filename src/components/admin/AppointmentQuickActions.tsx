'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

const actions = [
  { status: 'CONFIRMED', labelZh: '确认预约', labelEn: 'Confirm', color: 'sky' },
  { status: 'COMPLETED', labelZh: '标记完成', labelEn: 'Complete', color: 'emerald' },
  { status: 'CANCELLED', labelZh: '标记取消', labelEn: 'Cancel', color: 'rose' },
  { status: 'NO_SHOW', labelZh: '标记爽约', labelEn: 'No-show', color: 'stone' },
] as const

const colorMap = {
  sky: 'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-400',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-400',
  stone: 'border-stone-200 bg-stone-100 text-stone-600 hover:border-stone-400',
}

export function AppointmentQuickActions({
  id,
  lang = 'zh',
  currentStatus,
}: {
  id: number
  lang?: AdminLang
  currentStatus?: string
}) {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = useState(currentStatus)
  const [message, setMessage] = useState('')
  const [msgTone, setMsgTone] = useState<'success' | 'error' | 'info'>('info')
  const [isPending, startTransition] = useTransition()

  function run(status: string) {
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        setActiveStatus(status)
        setMessage(t(lang, '操作成功', 'Done'))
        setMsgTone('success')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '操作失败', 'Failed'))
        setMsgTone('error')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const isCurrent = activeStatus === action.status
          return (
            <button
              key={action.status}
              type="button"
              onClick={() => run(action.status)}
              disabled={isPending || isCurrent}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition disabled:cursor-not-allowed ${
                isCurrent
                  ? 'border-stone-300 bg-stone-900 text-white opacity-80'
                  : `${colorMap[action.color]} disabled:opacity-50`
              }`}
            >
              {isCurrent ? `✓ ${t(lang, action.labelZh, action.labelEn)}` : t(lang, action.labelZh, action.labelEn)}
            </button>
          )
        })}
      </div>
      {message ? <NoticePill message={message} tone={msgTone} className="text-xs" /> : null}
    </div>
  )
}
