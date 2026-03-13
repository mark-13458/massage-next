'use client'

import { useState, useTransition } from 'react'

const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const

type Props = {
  id: number
  currentStatus: string
  internalNote?: string | null
}

export function AppointmentStatusControls({ id, currentStatus, internalNote }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState(internalNote ?? '')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  async function save() {
    setMessage('')

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, internalNote: note }),
        })

        if (!response.ok) {
          throw new Error('Update failed')
        }

        setMessage('已保存')
      } catch {
        setMessage('保存失败')
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
        {message ? <span className="text-xs text-stone-500">{message}</span> : null}
      </div>
    </div>
  )
}
