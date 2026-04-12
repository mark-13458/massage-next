'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
type NoticeTone = 'success' | 'error'

type TagOption = { id: number; nameDe: string; nameEn: string; slug: string }

type ArticleFormProps = {
  mode: 'create' | 'edit'
  lang?: AdminLang
  allTags?: TagOption[]
  article?: {
    id: number
    slug: string
    titleDe: string
    titleEn: string
    summaryDe?: string | null
    summaryEn?: string | null
    contentDe?: string | null
    contentEn?: string | null
    seoTitleDe?: string | null
    seoTitleEn?: string | null
    seoDescriptionDe?: string | null
    seoDescriptionEn?: string | null
    seoKeywordsDe?: string | null
    seoKeywordsEn?: string | null
    coverImageId?: number | null
    coverImageUrl?: string | null
    isPublished: boolean
    publishedAt?: string | null
    sortOrder: number
    source?: string
    tagIds?: number[]
  }
}

function t(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function ArticleForm({ mode, article, lang = 'zh', allTags = [] }: ArticleFormProps) {
  const [form, setForm] = useState({
    slug: article?.slug ?? '',
    titleDe: article?.titleDe ?? '',
    titleEn: article?.titleEn ?? '',
    summaryDe: article?.summaryDe ?? '',
    summaryEn: article?.summaryEn ?? '',
    contentDe: article?.contentDe ?? '',
    contentEn: article?.contentEn ?? '',
    seoTitleDe: article?.seoTitleDe ?? '',
    seoTitleEn: article?.seoTitleEn ?? '',
    seoDescriptionDe: article?.seoDescriptionDe ?? '',
    seoDescriptionEn: article?.seoDescriptionEn ?? '',
    seoKeywordsDe: article?.seoKeywordsDe ?? '',
    seoKeywordsEn: article?.seoKeywordsEn ?? '',
    coverImageId: article?.coverImageId ?? null as number | null,
    coverImageUrl: article?.coverImageUrl ?? '',
    isPublished: article?.isPublished ?? false,
    publishedAt: article?.publishedAt ? article.publishedAt.slice(0, 16) : '',
    sortOrder: String(article?.sortOrder ?? 0),
    tagIds: article?.tagIds ?? [] as number[],
  })

  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverUploading, startCoverTransition] = useTransition()
  const coverRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [slugTouched, setSlugTouched] = useState(Boolean(article?.slug))
  const [isPending, startTransition] = useTransition()

  // 初始化封面图预览
  useEffect(() => {
    if (article?.coverImageUrl) setCoverPreview(article.coverImageUrl)
  }, [article?.coverImageUrl])

  const endpoint = useMemo(() => {
    return mode === 'create' ? '/api/admin/articles' : `/api/admin/articles/${article?.id}`
  }, [mode, article?.id])

  // 自动 slug
  useEffect(() => {
    if (slugTouched) return
    const source = form.titleEn || form.titleDe
    setForm((c) => ({ ...c, slug: slugify(source) }))
  }, [form.titleDe, form.titleEn, slugTouched])

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
            sortOrder: Number(form.sortOrder) || 0,
            coverImageId: form.coverImageId,
            coverImageUrl: form.coverImageUrl || null,
            publishedAt: form.isPublished ? (form.publishedAt || new Date().toISOString()) : null,
          }),
        })
        setMessage(mode === 'create' ? t(lang, '文章已创建', 'Article created') : t(lang, '文章已保存', 'Article saved'))
        setMessageTone('success')
      } catch {
        setMessage(t(lang, '保存失败', 'Save failed'))
        setMessageTone('error')
      }
    })
  }

  const inputCls = 'rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500'

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      {/* 基本信息 */}
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
        {t(lang, '基本信息', 'Basic info')}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '链接标识', 'Slug')}</span>
          <input value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: slugify(e.target.value) }) }} className={inputCls} />
          <span className="text-xs text-stone-500">/blog/{form.slug || 'your-article'}</span>
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '显示顺序', 'Sort order')}</span>
          <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '标题（德语）', 'Title (DE)')}</span>
          <input value={form.titleDe} onChange={(e) => setForm({ ...form, titleDe: e.target.value })} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '标题（英语）', 'Title (EN)')}</span>
          <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '摘要（德语）', 'Summary (DE)')}</span>
          <textarea rows={3} value={form.summaryDe} onChange={(e) => setForm({ ...form, summaryDe: e.target.value })} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '摘要（英语）', 'Summary (EN)')}</span>
          <textarea rows={3} value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} className={inputCls} />
        </label>
      </div>

      {/* 正文 */}
      <p className="mb-4 mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
        {t(lang, '文章正文（HTML）', 'Article content (HTML)')}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '正文（德语）', 'Content (DE)')}</span>
          <textarea rows={14} value={form.contentDe} onChange={(e) => setForm({ ...form, contentDe: e.target.value })} className={`${inputCls} font-mono text-xs`} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, '正文（英语）', 'Content (EN)')}</span>
          <textarea rows={14} value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} className={`${inputCls} font-mono text-xs`} />
        </label>
      </div>

      {/* SEO */}
      <p className="mb-4 mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
        {t(lang, 'SEO 优化', 'SEO settings')}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, 'SEO 标题（德语）', 'SEO title (DE)')}</span>
          <input value={form.seoTitleDe} onChange={(e) => setForm({ ...form, seoTitleDe: e.target.value })} placeholder={t(lang, '留空则使用文章标题', 'Leave empty to use article title')} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, 'SEO 标题（英语）', 'SEO title (EN)')}</span>
          <input value={form.seoTitleEn} onChange={(e) => setForm({ ...form, seoTitleEn: e.target.value })} placeholder={t(lang, '留空则使用文章标题', 'Leave empty to use article title')} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, 'SEO 描述（德语）', 'SEO description (DE)')}</span>
          <textarea rows={2} value={form.seoDescriptionDe} onChange={(e) => setForm({ ...form, seoDescriptionDe: e.target.value })} placeholder="155 Zeichen max." className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, 'SEO 描述（英语）', 'SEO description (EN)')}</span>
          <textarea rows={2} value={form.seoDescriptionEn} onChange={(e) => setForm({ ...form, seoDescriptionEn: e.target.value })} placeholder="155 chars max." className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, 'SEO 关键词（德语）', 'SEO keywords (DE)')}</span>
          <input value={form.seoKeywordsDe} onChange={(e) => setForm({ ...form, seoKeywordsDe: e.target.value })} placeholder={t(lang, '逗号分隔', 'Comma separated')} className={inputCls} />
        </label>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span>{t(lang, 'SEO 关键词（英语）', 'SEO keywords (EN)')}</span>
          <input value={form.seoKeywordsEn} onChange={(e) => setForm({ ...form, seoKeywordsEn: e.target.value })} placeholder={t(lang, '逗号分隔', 'Comma separated')} className={inputCls} />
        </label>
      </div>

      {/* 标签 */}
      {allTags.length > 0 && (
        <>
          <p className="mb-4 mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
            {t(lang, '标签', 'Tags')}
          </p>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const selected = form.tagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setForm((f) => ({
                    ...f,
                    tagIds: selected ? f.tagIds.filter((tid) => tid !== tag.id) : [...f.tagIds, tag.id],
                  }))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${selected ? 'bg-stone-900 text-white' : 'border border-stone-200 bg-white text-stone-700 hover:border-stone-400'}`}
                >
                  {t(lang, tag.nameDe, tag.nameEn)}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* 封面图 */}
      <p className="mb-4 mt-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
        {t(lang, '封面图', 'Cover image')}
      </p>

      {coverPreview || form.coverImageUrl ? (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
            <Image src={coverPreview || form.coverImageUrl} alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => coverRef.current?.click()} disabled={coverUploading} className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-400 disabled:opacity-60">
              {coverUploading ? t(lang, '上传中…', 'Uploading...') : t(lang, '更换图片', 'Replace image')}
            </button>
            <button type="button" onClick={() => { setForm((f) => ({ ...f, coverImageId: null, coverImageUrl: '' })); setCoverPreview(null) }} className="rounded-full border border-rose-100 px-4 py-2 text-sm text-rose-600 transition hover:border-rose-300">
              {t(lang, '移除图片', 'Remove image')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => coverRef.current?.click()} disabled={coverUploading} className="flex h-24 w-full items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-sm text-stone-400 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-60">
            {coverUploading ? t(lang, '上传中…', 'Uploading...') : t(lang, '点击上传封面图', 'Click to upload cover image')}
          </button>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '或填写外部图片 URL', 'Or enter external image URL')}</span>
            <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." className={inputCls} />
          </label>
        </div>
      )}

      <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''
        startCoverTransition(async () => {
          try {
            const fd = new FormData()
            fd.append('file', file)
            fd.append('usage', 'article-cover')
            const result = await adminRequest<{ item: { id: number; imageUrl: string } }>('/api/admin/upload', { method: 'POST', body: fd })
            const uploaded = result?.item
            if (!uploaded) throw new Error('Upload returned no data')
            setForm((f) => ({ ...f, coverImageId: uploaded.id, coverImageUrl: '' }))
            setCoverPreview(uploaded.imageUrl)
          } catch {
            setMessage(t(lang, '封面图上传失败', 'Cover upload failed'))
            setMessageTone('error')
          }
        })
      }} />

      {/* 发布 */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
          {t(lang, '发布文章', 'Publish')}
        </label>
        {form.isPublished && (
          <label className="flex flex-col gap-1 text-sm text-stone-700">
            <input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} className={inputCls} />
          </label>
        )}
        {article?.source === 'AI_GENERATED' && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">AI {t(lang, '生成', 'Generated')}</span>
        )}
      </div>

      {/* 提交 */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button type="button" onClick={submit} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '保存中…', 'Saving...') : mode === 'create' ? t(lang, '创建文章', 'Create article') : t(lang, '保存修改', 'Save changes')}
        </button>
        {message ? <NoticePill message={message} tone={messageTone} /> : null}
      </div>
    </div>
  )
}
