'use client'

import { ChangeEvent, useState, useTransition } from 'react'

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024
const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function validateImageFile(file: File, usage: 'hero' | 'gallery') {
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return '仅支持 JPG、PNG、WEBP、GIF 图片'
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return '图片不能超过 10MB'
  }

  if (usage === 'hero') {
    return '将继续由服务端校验 Hero 最低尺寸：1200×600'
  }

  return '将继续由服务端校验 Gallery 最低尺寸：600×400'
}

type Contact = {
  phone?: string | null
  email?: string | null
  address?: string | null
}

type Hero = {
  eyebrowDe?: string | null
  eyebrowEn?: string | null
  titleDe?: string | null
  titleEn?: string | null
  subtitleDe?: string | null
  subtitleEn?: string | null
  noteDe?: string | null
  noteEn?: string | null
  imageUrl?: string | null
}

type Hour = {
  weekday: number
  label: string
  openTime?: string | null
  closeTime?: string | null
  isClosed: boolean
}

type Faq = {
  id: number | string
  questionDe: string
  questionEn: string
  answerDe: string
  answerEn: string
  sortOrder: number
  isActive: boolean
  _create?: boolean
  _delete?: boolean
}

type GalleryItem = {
  id: number | string
  titleDe: string
  titleEn: string
  altDe: string
  altEn: string
  imageUrl: string
  width?: number
  height?: number
  sortOrder: number
  isActive: boolean
  isCover: boolean
  _create?: boolean
  _delete?: boolean
}

type NoticeTone = 'success' | 'error' | 'info'

function noticeClassName(tone: NoticeTone) {
  if (tone === 'success') return 'text-emerald-700'
  if (tone === 'error') return 'text-rose-700'
  return 'text-stone-500'
}

export function ContentEditor({
  initialContact,
  initialHero,
  initialHours,
  initialFaqs,
  initialGallery,
}: {
  initialContact: Contact | null
  initialHero: Hero | null
  initialHours: Hour[]
  initialFaqs: Faq[]
  initialGallery: GalleryItem[]
}) {
  const [contact, setContact] = useState<Contact>(initialContact ?? { phone: '', email: '', address: '' })
  const [hero, setHero] = useState<Hero>(initialHero ?? {})
  const [hours, setHours] = useState(initialHours)
  const [faqs, setFaqs] = useState(initialFaqs)
  const [gallery, setGallery] = useState(initialGallery)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('info')
  const [uploadMessage, setUploadMessage] = useState('')
  const [uploadMessageTone, setUploadMessageTone] = useState<NoticeTone>('info')
  const [heroUploadMessage, setHeroUploadMessage] = useState('')
  const [heroUploadMessageTone, setHeroUploadMessageTone] = useState<NoticeTone>('info')
  const [isPending, startTransition] = useTransition()
  const [isUploading, startUploadTransition] = useTransition()
  const [isHeroUploading, startHeroUploadTransition] = useTransition()

  async function save() {
    setMessage('正在保存内容…')
    setMessageTone('info')
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/content', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact, hero, hours, faqs, gallery }),
        })
        const json = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(json.error || 'Save failed')
        setMessage('内容已保存')
        setMessageTone('success')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : '保存失败')
        setMessageTone('error')
      }
    })
  }

  function addFaq() {
    setFaqs([...faqs, { id: `new-${Date.now()}`, questionDe: '', questionEn: '', answerDe: '', answerEn: '', sortOrder: faqs.length + 1, isActive: true, _create: true }])
  }

  function removeFaq(index: number) {
    const item = faqs[index]
    const next = [...faqs]
    if (item._create) next.splice(index, 1)
    else next[index] = { ...item, _delete: true }
    setFaqs(next)
  }

  function addGalleryItem() {
    setGallery([...gallery, { id: `new-${Date.now()}`, titleDe: '', titleEn: '', altDe: '', altEn: '', imageUrl: '', sortOrder: gallery.length + 1, isActive: true, isCover: false, _create: true }])
  }

  function setGalleryCover(index: number, checked: boolean) {
    setGallery((current) => current.map((item, itemIndex) => ({
      ...item,
      isCover: checked ? itemIndex === index : itemIndex === index ? false : item.isCover,
    })))
  }

  function removeGalleryItem(index: number) {
    const item = gallery[index]
    const next = [...gallery]
    if (item._create) next.splice(index, 1)
    else next[index] = { ...item, _delete: true }
    setGallery(next)
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationMessage = validateImageFile(file, 'gallery')
    if (validationMessage === '仅支持 JPG、PNG、WEBP、GIF 图片' || validationMessage === '图片不能超过 10MB') {
      setUploadMessage(validationMessage)
      setUploadMessageTone('error')
      event.target.value = ''
      return
    }

    setUploadMessage(validationMessage)
    setUploadMessageTone('info')
    const formData = new FormData()
    formData.append('usage', 'gallery')
    formData.append('file', file)
    formData.append('titleDe', file.name.replace(/\.[^.]+$/, ''))
    formData.append('titleEn', file.name.replace(/\.[^.]+$/, ''))
    formData.append('sortOrder', String(gallery.length + 1))
    formData.append('isActive', 'true')
    formData.append('isCover', 'false')

    startUploadTransition(async () => {
      try {
        const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        const json = await response.json().catch(() => ({}))
        if (!response.ok || !json.item) throw new Error(json.error || 'Upload failed')
        setGallery((current) => [...current, json.item])
        setUploadMessage(`上传成功，已加入图库列表（${json.item.width || '?'}×${json.item.height || '?'}）`)
        setUploadMessageTone('success')
      } catch (error) {
        setUploadMessage(error instanceof Error ? error.message : '上传失败')
        setUploadMessageTone('error')
      } finally {
        event.target.value = ''
      }
    })
  }

  function handleHeroUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationMessage = validateImageFile(file, 'hero')
    if (validationMessage === '仅支持 JPG、PNG、WEBP、GIF 图片' || validationMessage === '图片不能超过 10MB') {
      setHeroUploadMessage(validationMessage)
      setHeroUploadMessageTone('error')
      event.target.value = ''
      return
    }

    setHeroUploadMessage(validationMessage)
    setHeroUploadMessageTone('info')
    const formData = new FormData()
    formData.append('usage', 'hero')
    formData.append('file', file)

    startHeroUploadTransition(async () => {
      try {
        const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
        const json = await response.json().catch(() => ({}))
        if (!response.ok || !json.item?.imageUrl) throw new Error(json.error || 'Upload failed')
        setHero((current) => ({ ...current, imageUrl: json.item.imageUrl }))
        setHeroUploadMessage(`Hero 图片上传成功（${json.item.width || '?'}×${json.item.height || '?'}）`)
        setHeroUploadMessageTone('success')
      } catch (error) {
        setHeroUploadMessage(error instanceof Error ? error.message : '上传失败')
        setHeroUploadMessageTone('error')
      } finally {
        event.target.value = ''
      }
    })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-900">首页 Hero</h2>
          <label className="cursor-pointer rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
            {isHeroUploading ? '上传中…' : '上传 Hero 图片'}
            <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" disabled={isHeroUploading} />
          </label>
        </div>
        {heroUploadMessage ? <p className={`mt-4 text-sm ${noticeClassName(heroUploadMessageTone)}`}>{heroUploadMessage}</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input value={hero.eyebrowDe ?? ''} onChange={(e) => setHero({ ...hero, eyebrowDe: e.target.value })} placeholder="Eyebrow DE" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <input value={hero.eyebrowEn ?? ''} onChange={(e) => setHero({ ...hero, eyebrowEn: e.target.value })} placeholder="Eyebrow EN" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <input value={hero.titleDe ?? ''} onChange={(e) => setHero({ ...hero, titleDe: e.target.value })} placeholder="Title DE" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <input value={hero.titleEn ?? ''} onChange={(e) => setHero({ ...hero, titleEn: e.target.value })} placeholder="Title EN" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <textarea value={hero.subtitleDe ?? ''} onChange={(e) => setHero({ ...hero, subtitleDe: e.target.value })} rows={4} placeholder="Subtitle DE" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <textarea value={hero.subtitleEn ?? ''} onChange={(e) => setHero({ ...hero, subtitleEn: e.target.value })} rows={4} placeholder="Subtitle EN" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <textarea value={hero.noteDe ?? ''} onChange={(e) => setHero({ ...hero, noteDe: e.target.value })} rows={3} placeholder="Image note DE" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <textarea value={hero.noteEn ?? ''} onChange={(e) => setHero({ ...hero, noteEn: e.target.value })} rows={3} placeholder="Image note EN" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
          <label className="flex flex-col gap-2 text-sm text-stone-700 md:col-span-2">
            <span>Hero 图片 URL</span>
            <input value={hero.imageUrl ?? ''} onChange={(e) => setHero({ ...hero, imageUrl: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">联系信息</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-700 md:col-span-2"><span>地址</span><input value={contact.address ?? ''} onChange={(e) => setContact({ ...contact, address: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" /></label>
          <label className="flex flex-col gap-2 text-sm text-stone-700"><span>电话</span><input value={contact.phone ?? ''} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" /></label>
          <label className="flex flex-col gap-2 text-sm text-stone-700"><span>Email</span><input value={contact.email ?? ''} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" /></label>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">营业时间</h2>
        <div className="mt-5 grid gap-4">
          {hours.map((item, index) => (
            <div key={item.weekday} className="grid gap-3 rounded-2xl border border-stone-100 p-4 md:grid-cols-[1.1fr_1fr_1fr_auto] md:items-center">
              <div className="text-sm font-medium text-stone-900">{item.label}</div>
              <input value={item.openTime ?? ''} onChange={(e) => { const next = [...hours]; next[index] = { ...item, openTime: e.target.value }; setHours(next) }} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
              <input value={item.closeTime ?? ''} onChange={(e) => { const next = [...hours]; next[index] = { ...item, closeTime: e.target.value }; setHours(next) }} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
              <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={item.isClosed} onChange={(e) => { const next = [...hours]; next[index] = { ...item, isClosed: e.target.checked }; setHours(next) }} />关闭</label>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-900">FAQ</h2>
          <button type="button" onClick={addFaq} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">新增 FAQ</button>
        </div>
        <div className="mt-5 grid gap-4">
          {faqs.filter((item) => !item._delete).map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-stone-100 p-4">
              <div className="mb-4 flex justify-end"><button type="button" onClick={() => removeFaq(index)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100">删除</button></div>
              <div className="grid gap-4 md:grid-cols-2">
                <input value={item.questionDe} onChange={(e) => { const next = [...faqs]; next[index] = { ...item, questionDe: e.target.value }; setFaqs(next) }} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                <input value={item.questionEn} onChange={(e) => { const next = [...faqs]; next[index] = { ...item, questionEn: e.target.value }; setFaqs(next) }} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                <textarea value={item.answerDe} onChange={(e) => { const next = [...faqs]; next[index] = { ...item, answerDe: e.target.value }; setFaqs(next) }} rows={4} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                <textarea value={item.answerEn} onChange={(e) => { const next = [...faqs]; next[index] = { ...item, answerEn: e.target.value }; setFaqs(next) }} rows={4} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-700">
                <label className="flex items-center gap-2"><span>排序</span><input value={String(item.sortOrder)} onChange={(e) => { const next = [...faqs]; next[index] = { ...item, sortOrder: Number(e.target.value) || 0 }; setFaqs(next) }} className="w-20 rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-500" /></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={item.isActive} onChange={(e) => { const next = [...faqs]; next[index] = { ...item, isActive: e.target.checked }; setFaqs(next) }} />启用</label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-stone-900">图库管理</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
              {isUploading ? '上传中…' : '上传图片'}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={isUploading} />
            </label>
            <button type="button" onClick={addGalleryItem} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">新增图片条目</button>
          </div>
        </div>
        {uploadMessage ? <p className={`mt-4 text-sm ${noticeClassName(uploadMessageTone)}`}>{uploadMessage}</p> : null}
        <div className="mt-5 grid gap-4">
          {gallery.filter((item) => !item._delete).length === 0 ? (
            <div className="text-sm text-stone-500">当前还没有图库数据。现在已经支持直接上传图片，或继续新增 URL 型图片条目。</div>
          ) : gallery.filter((item) => !item._delete).map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-stone-100 p-4">
              <div className="mb-4 flex justify-end"><button type="button" onClick={() => removeGalleryItem(index)} className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100">删除</button></div>
              <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                <img src={item.imageUrl || 'https://placehold.co/400x500?text=Gallery'} alt={item.titleDe || item.titleEn || 'Gallery'} className="h-28 w-full rounded-2xl object-cover" />
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={item.titleDe} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, titleDe: e.target.value }; setGallery(next) }} placeholder="标题 DE" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                  <input value={item.titleEn} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, titleEn: e.target.value }; setGallery(next) }} placeholder="标题 EN" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                  <input value={item.altDe} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, altDe: e.target.value }; setGallery(next) }} placeholder="Alt DE" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                  <input value={item.altEn} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, altEn: e.target.value }; setGallery(next) }} placeholder="Alt EN" className="rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-amber-500" />
                  <label className="flex flex-col gap-2 text-sm text-stone-700 md:col-span-2"><span>图片 URL</span><input value={item.imageUrl} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, imageUrl: e.target.value }; setGallery(next) }} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" /></label>
                  <label className="flex items-center gap-2 text-sm text-stone-700"><span>排序</span><input value={String(item.sortOrder)} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, sortOrder: Number(e.target.value) || 0 }; setGallery(next) }} className="w-20 rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-500" /></label>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-stone-700">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={item.isActive} onChange={(e) => { const next = [...gallery]; next[index] = { ...item, isActive: e.target.checked }; setGallery(next) }} />启用</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={item.isCover} onChange={(e) => setGalleryCover(index, e.target.checked)} />封面（仅一张）</label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="button" onClick={save} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? '保存中…' : '保存内容'}
        </button>
        {message ? <span className={`text-sm ${noticeClassName(messageTone)}`}>{message}</span> : null}
      </div>
    </div>
  )
}
