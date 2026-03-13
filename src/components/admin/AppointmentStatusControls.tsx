'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { APPOINTMENT_STATUS_OPTIONS, appointmentStatusLabel } from '../../lib/admin-status'

type NoticeTone = 'success' | 'error' | 'info'
type AdminLang = 'zh' | 'en'

function noticeClassName(tone: NoticeTone) {
  if (tone === 'success') return 'text-emerald-700'
  if (tone === 'error') return 'text-rose-700'
  return 'text-stone-500'
}

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

type Props = {
  id: number
  currentStatus: string
  internalNote?: string | null
  lang?: AdminLang
}

export function AppointmentStatusControls({ id, currentStatus, internalNote, lang = 'zh' }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(internalNote ?? '')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [isPending, startTransition] = useTransition()

  async function save() {
    setMessage(t(lang, '正在保存预约状态…', 'Saving booking status...'))
    setMessageTone('info')

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, internalNote: note }),
        })
        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(json.error || t(lang, '更新失败', 'Update failed'))
        }

        setMessage(t(lang, '预约状态已保存，页面已刷新', 'Booking status saved and page refreshed'))
        setMessageTone('success')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '保存失败', 'Save failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="min-w-[220px] space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
      >
        {APPOINTMENT_STATUS_OPTIONS.map((item) => (
          <option key={item} value={item}>
            {appointmentStatusLabel(item, lang)}
          </option>
        ))}
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t(lang, '内部备注', 'Internal note')}
        rows={3}
        className="w-full rounded-2xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? t(lang, '保存中…', 'Saving...') : t(lang, '保存', 'Save')}
        </button>
        {message ? <span className={`text-xs ${noticeClassName(messageTone)}`}>{message}</span> : null}
      </div>
    </div>
  )
}
