'use client'

import { useMemo, useState, useTransition } from 'react'

type AdminLang = 'zh' | 'en'

type ServiceFormProps = {
  mode: 'create' | 'edit'
  lang?: AdminLang
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

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function ServiceForm({ mode, service, lang = 'zh' }: ServiceFormProps) {
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
          throw new Error(t(lang, '保存失败', 'Save failed'))
        }

        setMessage(mode === 'create' ? t(lang, '服务已创建', 'Service created') : t(lang, '服务已保存', 'Service saved'))
      } catch {
        setMessage(t(lang, '保存失败', 'Save failed'))
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
          <span>{t(lang, '排序', 'Sort order')}</span>
          <input value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '名称（德语）', 'Name (DE)')}</span>
          <input value={form.nameDe} onChange={(e) => setForm({ ...form, nameDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '名称（英语）', 'Name (EN)')}</span>
          <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '摘要（德语）', 'Summary (DE)')}</span>
          <textarea rows={3} value={form.summaryDe} onChange={(e) => setForm({ ...form, summaryDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '摘要（英语）', 'Summary (EN)')}</span>
          <textarea rows={3} value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '描述（德语）', 'Description (DE)')}</span>
          <textarea rows={5} value={form.descriptionDe} onChange={(e) => setForm({ ...form, descriptionDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '描述（英语）', 'Description (EN)')}</span>
          <textarea rows={5} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '时长（分钟）', 'Duration (minutes)')}</span>
          <input value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '价格 (€)', 'Price (€)')}</span>
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />{t(lang, '精选', 'Featured')}
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />{t(lang, '上架', 'Published')}
        </label>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '保存中…', 'Saving...') : mode === 'create' ? t(lang, '创建服务', 'Create service') : t(lang, '保存修改', 'Save changes')}
        </button>
        {message ? <span className="text-sm text-stone-500">{message}</span> : null}
      </div>
    </div>
  )
}
