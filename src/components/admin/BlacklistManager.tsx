'use client'

import { useState, useTransition } from 'react'

type BlacklistEntry = {
  id: number
  type: string
  value: string
  reason: string | null
  createdAt: string
}

type Props = {
  lang: 'zh' | 'en'
  initial: BlacklistEntry[]
  prefillType?: string
  prefillValue?: string
}

const typeLabel: Record<string, { zh: string; en: string; color: string }> = {
  PHONE: { zh: '电话', en: 'Phone', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  EMAIL: { zh: '邮箱', en: 'Email', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  IP:    { zh: 'IP',   en: 'IP',    color: 'bg-stone-100 text-stone-700 border-stone-200' },
}

export function BlacklistManager({ lang, initial, prefillType, prefillValue }: Props) {
  const [items, setItems] = useState<BlacklistEntry[]>(initial)
  const [type, setType] = useState<'PHONE' | 'EMAIL' | 'IP'>(
    (prefillType as 'PHONE' | 'EMAIL' | 'IP') || 'PHONE'
  )
  const [value, setValue] = useState(prefillValue || '')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const zh = lang === 'zh'

  function handleAdd() {
    if (!value.trim()) return
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value: value.trim(), reason: reason.trim() || undefined }),
      })
      if (!res.ok) {
        setError(zh ? '添加失败，可能已存在' : 'Failed to add — may already exist')
        return
      }
      const data = await res.json()
      setItems((prev) => [{ ...data.item, createdAt: data.item.createdAt || new Date().toISOString() }, ...prev])
      setValue('')
      setReason('')
    })
  }

  function handleDelete(id: number) {
    if (!window.confirm(zh ? '确认移除此封禁？' : 'Remove this block?')) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/blacklist/${id}`, { method: 'DELETE' })
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
        <h3 className="text-sm font-semibold text-stone-900 mb-4">
          {zh ? '添加封禁' : 'Add block'}
        </h3>
        <div className="grid gap-3 sm:grid-cols-[120px_1fr_1fr_auto]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'PHONE' | 'EMAIL' | 'IP')}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
          >
            <option value="PHONE">{zh ? '电话' : 'Phone'}</option>
            <option value="EMAIL">{zh ? '邮箱' : 'Email'}</option>
            <option value="IP">IP</option>
          </select>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={zh ? '具体值（如 +49123456）' : 'Value (e.g. +49123456)'}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={zh ? '备注原因（选填）' : 'Reason (optional)'}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500"
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !value.trim()}
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {zh ? '封禁' : 'Block'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-sm text-stone-500">{zh ? '暂无封禁记录' : 'No blocked entries'}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
                <th className="pb-2 pr-4 font-medium">{zh ? '类型' : 'Type'}</th>
                <th className="pb-2 pr-4 font-medium">{zh ? '值' : 'Value'}</th>
                <th className="pb-2 pr-4 font-medium">{zh ? '备注' : 'Reason'}</th>
                <th className="pb-2 pr-4 font-medium">{zh ? '时间' : 'Added'}</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item) => {
                const tl = typeLabel[item.type] ?? { zh: item.type, en: item.type, color: 'bg-stone-100 text-stone-700' }
                return (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${tl.color}`}>
                        {zh ? tl.zh : tl.en}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-stone-900">{item.value}</td>
                    <td className="py-3 pr-4 text-stone-500">{item.reason || '—'}</td>
                    <td className="py-3 pr-4 text-stone-400 whitespace-nowrap">
                      {new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.createdAt))}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {zh ? '移除' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
