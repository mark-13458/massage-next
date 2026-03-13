'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const

type NoticeTone = 'success' | 'error' | 'info'

function noticeClassName(tone: NoticeTone) {
  if (tone === 'success') return 'text-emerald-700'
  if (tone === 'error') return 'text-rose-700'
  return 'text-stone-500'
}

type Props = {
  id: number
  currentStatus: string
  internalNote?: string | null
}

export function AppointmentStatusControls({ id, currentStatus, internalNote }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(internalNote ?? '')
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [isPending, startTransition] = useTransition()

  async function save() {
    setMessage('正在保存预约状态…')
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
          throw new Error(json.error || 'Update failed')
        }

        setMessage('预约状态已保存，页面已刷新')
        setMessageTone('success')
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存失败')
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
        {statuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="内部备注"
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
          {isPending ? '保存中…' : '保存'}
        </button>
        {message ? <span className={`text-xs ${noticeClassName(messageTone)}`}>{message}</span> : null}
      </div>
    </div>
  )
}
