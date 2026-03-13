'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

const actions = [
  { label: '确认预约', status: 'CONFIRMED' },
  { label: '标记完成', status: 'COMPLETED' },
  { label: '标记取消', status: 'CANCELLED' },
  { label: '标记爽约', status: 'NO_SHOW' },
] as const

export function AppointmentQuickActions({ id }: { id: number }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function run(status: string) {
    setMessage('')
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) {
          throw new Error('Action failed')
        }

        setMessage('操作成功')
        router.refresh()
      } catch {
        setMessage('操作失败')
      }
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
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
      {message ? <p className="text-xs text-stone-500">{message}</p> : null}
    </div>
  )
}
