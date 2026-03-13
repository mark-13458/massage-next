'use client'

import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'

type NoticeTone = 'success' | 'error' | 'info'

function noticeClassName(tone: NoticeTone) {
  if (tone === 'success') return 'text-emerald-700'
  if (tone === 'error') return 'text-rose-700'
  return 'text-stone-500'
}

type Props = {
  id: number
  initialActive: boolean
  initialFeatured: boolean
  initialSortOrder: number
}

export function ServiceControls({ id, initialActive, initialFeatured, initialSortOrder }: Props) {
  const [isActive, setIsActive] = useState(initialActive)
  const [isFeatured, setIsFeatured] = useState(initialFeatured)
  const [sortOrder, setSortOrder] = useState(String(initialSortOrder))
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [isPending, startTransition] = useTransition()

  async function save() {
    setMessage('正在保存服务配置…')
    setMessageTone('info')

    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/services/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isActive,
            isFeatured,
            sortOrder: Number(sortOrder) || 0,
          }),
        })

        setMessage('服务配置已保存')
        setMessageTone('success')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存失败')
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="min-w-[240px] space-y-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
      <label className="flex items-center gap-2 text-xs text-stone-700">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        上架
      </label>

      <label className="flex items-center gap-2 text-xs text-stone-700">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        精选
      </label>

      <label className="flex items-center gap-2 text-xs text-stone-700">
        <span>排序</span>
        <input
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-24 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
      </label>

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
