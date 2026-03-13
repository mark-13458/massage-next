'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function DeleteServiceButton({ id }: { id: number }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  async function remove() {
    const ok = window.confirm('确认删除这个服务吗？此操作不可撤销。')
    if (!ok) return

    setMessage('')
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/services/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Delete failed')
        }

        setMessage('已删除')
        router.push('/admin/services')
        router.refresh()
      } catch {
        setMessage('删除失败')
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
        {isPending ? '删除中…' : '删除服务'}
      </button>
      {message ? <span className="text-xs text-stone-500">{message}</span> : null}
    </div>
  )
}
