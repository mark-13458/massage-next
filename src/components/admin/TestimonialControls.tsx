'use client'

import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
function t(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }

type Item = {
  id: number
  customerName: string
  locale: string
  rating: number
  content: string
  sortOrder: number
  isPublished: boolean
}

export function TestimonialRow({ item, lang, onDeleted }: { item: Item; lang: AdminLang; onDeleted: (id: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...item, rating: String(item.rating), sortOrder: String(item.sortOrder) })
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/testimonials/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, rating: Number(form.rating), sortOrder: Number(form.sortOrder) }),
        })
        setMsg(t(lang, '已保存', 'Saved'))
        setEditing(false)
      } catch {
        setMsg(t(lang, '保存失败', 'Save failed'))
      }
    })
  }

  function remove() {
    if (!confirm(t(lang, '确认删除这条评价？', 'Delete this testimonial?'))) return
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/testimonials/${item.id}`, { method: 'DELETE' })
        onDeleted(item.id)
      } catch {
        setMsg(t(lang, '删除失败', 'Delete failed'))
      }
    })
  }

  function togglePublish() {
    startTransition(async () => {
      try {
        await adminRequest(`/api/admin/testimonials/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: !form.isPublished }),
        })
        setForm((f) => ({ ...f, isPublished: !f.isPublished }))
      } catch {
        setMsg(t(lang, '操作失败', 'Failed'))
      }
    })
  }

  return (
    <div className="rounded-3xl border border-stone-100 bg-white p-5">
      {editing ? (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-stone-700">
              {t(lang, '客户姓名', 'Customer name')}
              <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-stone-700">
              {t(lang, '语言', 'Locale')}
              <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500">
                <option value="de">DE</option>
                <option value="en">EN</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-stone-700">
              {t(lang, '评分 (1-5)', 'Rating (1-5)')}
              <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-stone-700">
              {t(lang, '排序', 'Sort order')}
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm text-stone-700">
            {t(lang, '评价内容', 'Content')}
            <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={save} disabled={isPending} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
              {isPending ? t(lang, '保存中…', 'Saving...') : t(lang, '保存', 'Save')}
            </button>
            <button onClick={() => setEditing(false)} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
              {t(lang, '取消', 'Cancel')}
            </button>
            {msg && <NoticePill message={msg} tone={msg.includes('失败') || msg === 'Save failed' || msg === 'Failed' ? 'error' : 'success'} />}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-900">{form.customerName}</span>
              <span className="rounded-full border border-stone-200 px-2 py-0.5 text-xs text-stone-500">{form.locale.toUpperCase()}</span>
              <span className="text-sm text-amber-500">{'★'.repeat(Number(form.rating))}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${form.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                {form.isPublished ? t(lang, '已发布', 'Published') : t(lang, '未发布', 'Unpublished')}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-stone-600">{form.content}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={togglePublish} disabled={isPending} className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-500 disabled:opacity-60">
              {form.isPublished ? t(lang, '取消发布', 'Unpublish') : t(lang, '发布', 'Publish')}
            </button>
            <button onClick={() => setEditing(true)} className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:border-stone-500">
              {t(lang, '编辑', 'Edit')}
            </button>
            <button onClick={remove} disabled={isPending} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
              {t(lang, '删除', 'Delete')}
            </button>
            {msg && <NoticePill message={msg} tone="error" />}
          </div>
        </div>
      )}
    </div>
  )
}

export function TestimonialCreateForm({ lang, onCreated }: { lang: AdminLang; onCreated: (item: Item) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ customerName: '', locale: 'de', rating: '5', content: '', sortOrder: '0', isPublished: true })
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      try {
        const res = await adminRequest('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, rating: Number(form.rating), sortOrder: Number(form.sortOrder) }),
        })
        const data = await res.json()
        onCreated(data.item)
        setForm({ customerName: '', locale: 'de', rating: '5', content: '', sortOrder: '0', isPublished: true })
        setOpen(false)
        setMsg('')
      } catch {
        setMsg(t(lang, '创建失败', 'Create failed'))
      }
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
        {t(lang, '+ 新增评价', '+ New testimonial')}
      </button>
    )
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5">
      <p className="mb-4 font-semibold text-stone-900">{t(lang, '新增评价', 'New testimonial')}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-stone-700">
          {t(lang, '客户姓名', 'Customer name')}
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-stone-700">
          {t(lang, '语言', 'Locale')}
          <select value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500">
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-stone-700">
          {t(lang, '评分 (1-5)', 'Rating (1-5)')}
          <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-stone-700">
          {t(lang, '排序', 'Sort order')}
          <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
        </label>
      </div>
      <label className="mt-3 flex flex-col gap-1 text-sm text-stone-700">
        {t(lang, '评价内容', 'Content')}
        <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-amber-500" />
      </label>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60">
          {isPending ? t(lang, '创建中…', 'Creating...') : t(lang, '创建', 'Create')}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {t(lang, '取消', 'Cancel')}
        </button>
        {msg && <NoticePill message={msg} tone="error" />}
      </div>
    </div>
  )
}
