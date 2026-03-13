'use client'

import { useMemo, useState, useTransition } from 'react'

type ServiceFormProps = {
  mode: 'create' | 'edit'
  service?: {
    id: number
    slug: string
    nameDe: string
    nameEn: string
    summaryDe?: string | null
    summaryEn?: string | null
    descriptionDe?: string | null
    descriptionEn?: string | null
    durationMin: number
    price: string
    sortOrder: number
    isFeatured: boolean
    isActive: boolean
  }
}

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const [form, setForm] = useState({
    slug: service?.slug ?? '',
    nameDe: service?.nameDe ?? '',
    nameEn: service?.nameEn ?? '',
    summaryDe: service?.summaryDe ?? '',
    summaryEn: service?.summaryEn ?? '',
    descriptionDe: service?.descriptionDe ?? '',
    descriptionEn: service?.descriptionEn ?? '',
    durationMin: String(service?.durationMin ?? 60),
    price: service?.price ?? '0',
    sortOrder: String(service?.sortOrder ?? 0),
    isFeatured: service?.isFeatured ?? false,
    isActive: service?.isActive ?? true,
  })
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const endpoint = useMemo(() => {
    return mode === 'create' ? '/api/admin/services' : `/api/admin/services/${service?.id}`
  }, [mode, service?.id])

  const method = mode === 'create' ? 'POST' : 'PATCH'

  async function submit() {
    setMessage('')

    startTransition(async () => {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            durationMin: Number(form.durationMin) || 60,
            price: Number(form.price) || 0,
            sortOrder: Number(form.sortOrder) || 0,
          }),
        })

        if (!response.ok) {
          throw new Error('Save failed')
        }

        setMessage(mode === 'create' ? '服务已创建' : '服务已保存')
      } catch {
        setMessage('保存失败')
      }
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>Slug</span>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>排序</span>
          <input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>名称（DE）</span>
          <input value={form.nameDe} onChange={(e) => setForm({ ...form, nameDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>Name (EN)</span>
          <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>摘要（DE）</span>
          <textarea rows={3} value={form.summaryDe} onChange={(e) => setForm({ ...form, summaryDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>Summary (EN)</span>
          <textarea rows={3} value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>描述（DE）</span>
          <textarea rows={5} value={form.descriptionDe} onChange={(e) => setForm({ ...form, descriptionDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>Description (EN)</span>
          <textarea rows={5} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>时长（分钟）</span>
          <input value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>价格 (€)</span>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />精选
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />上架
        </label>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? '保存中…' : mode === 'create' ? '创建服务' : '保存修改'}
        </button>
        {message ? <span className="text-sm text-stone-500">{message}</span> : null}
      </div>
    </div>
  )
}
