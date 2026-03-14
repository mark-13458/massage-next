'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'

type NoticeTone = 'success' | 'error'

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
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
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [slugTouched, setSlugTouched] = useState(Boolean(service?.slug))
  const [isPending, startTransition] = useTransition()

  const endpoint = useMemo(() => {
    return mode === 'create' ? '/api/admin/services' : `/api/admin/services/${service?.id}`
  }, [mode, service?.id])

  useEffect(() => {
    if (slugTouched) return

    const source = form.nameEn || form.nameDe
    const nextSlug = slugify(source)

    setForm((current) => ({
      ...current,
      slug: nextSlug,
    }))
  }, [form.nameDe, form.nameEn, slugTouched])

  const method = mode === 'create' ? 'POST' : 'PATCH'

  async function submit() {
    setMessage('')

    startTransition(async () => {
      try {
        await adminRequest(endpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            durationMin: Number(form.durationMin) || 60,
            price: Number(form.price) || 0,
            sortOrder: Number(form.sortOrder) || 0,
          }),
        })

        setMessage(mode === 'create' ? t(lang, '服务已创建', 'Service created') : t(lang, '服务已保存', 'Service saved'))
        setMessageTone('success')
      } catch {
        setMessage(t(lang, '保存失败', 'Save failed'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '链接标识', 'Slug')}</span>
          <input value={form.slug} onChange={(e) => {
            setSlugTouched(true)
            setForm({ ...form, slug: slugify(e.target.value) })
          }} placeholder={t(lang, '用于生成页面链接，建议只用小写字母、数字和连字符', 'Used for page URLs. Prefer lowercase letters, numbers and hyphens')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          <span className="text-xs text-stone-500">{t(lang, `当前链接：/services/${form.slug || 'your-service'}`, `Current path: /services/${form.slug || 'your-service'}`)}</span>
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '显示顺序', 'Sort order')}</span>
          <input type="number" step="1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder={t(lang, '数字越小越靠前', 'Smaller numbers appear earlier')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
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
          <span>{t(lang, '简短介绍（德语）', 'Summary (DE)')}</span>
          <textarea rows={3} value={form.summaryDe} onChange={(e) => setForm({ ...form, summaryDe: e.target.value })} placeholder={t(lang, '用于列表页和卡片上的简短说明', 'Short summary used in cards and list views')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '简短介绍（英语）', 'Summary (EN)')}</span>
          <textarea rows={3} value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} placeholder={t(lang, '用于列表页和卡片上的简短说明', 'Short summary used in cards and list views')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '详细介绍（德语）', 'Description (DE)')}</span>
          <textarea rows={5} value={form.descriptionDe} onChange={(e) => setForm({ ...form, descriptionDe: e.target.value })} placeholder={t(lang, '填写服务流程、特点、适合人群等更完整说明', 'Describe the service flow, highlights and suitable audience in more detail')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '详细介绍（英语）', 'Description (EN)')}</span>
          <textarea rows={5} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder={t(lang, '填写服务流程、特点、适合人群等更完整说明', 'Describe the service flow, highlights and suitable audience in more detail')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '服务时长（分钟）', 'Duration (minutes)')}</span>
          <input type="number" min="0" step="5" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} placeholder={t(lang, '例如 60、90、120', 'For example: 60, 90 or 120')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '服务价格 (€)', 'Price (€)')}</span>
          <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder={t(lang, '例如 59、79、99', 'For example: 59, 79 or 99')} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
        </label>

        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />{t(lang, '设为推荐服务', 'Featured')}
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />{t(lang, '上架显示', 'Published')}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '保存中…', 'Saving...') : mode === 'create' ? t(lang, '创建服务', 'Create service') : t(lang, '保存修改', 'Save changes')}
        </button>
        {message ? <NoticePill message={message} tone={messageTone} /> : null}
      </div>
    </div>
  )
}
