'use client'

import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

type AdminLang = 'zh' | 'en'
type NoticeTone = 'success' | 'error'

interface AdminLogoFormProps {
  initialLogoUrl?: string | null
  initialFaviconUrl?: string | null
  lang?: AdminLang
}

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function AdminLogoForm({ initialLogoUrl, initialFaviconUrl, lang = 'zh' }: AdminLogoFormProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl ?? null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialFaviconUrl ?? null)

  const [logoMsg, setLogoMsg] = useState('')
  const [logoTone, setLogoTone] = useState<NoticeTone>('success')
  const [faviconMsg, setFaviconMsg] = useState('')
  const [faviconTone, setFaviconTone] = useState<NoticeTone>('success')

  const [logoUploading, startLogoTransition] = useTransition()
  const [faviconUploading, startFaviconTransition] = useTransition()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(
    file: File,
    usage: 'logo' | 'favicon',
  ): Promise<{ id: number; imageUrl: string } | null> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('usage', usage)
    const result = await adminRequest<{ item: { id: number; imageUrl: string } }>('/api/admin/upload', {
      method: 'POST',
      body: fd,
    })
    return result?.item ?? null
  }

  async function patchSettings(payload: Record<string, number | null>) {
    await adminRequest('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setLogoMsg('')

    startLogoTransition(async () => {
      try {
        const uploaded = await uploadFile(file, 'logo')
        if (!uploaded) throw new Error('Upload returned no data')
        await patchSettings({ logoFileId: uploaded.id })
        setLogoUrl(uploaded.imageUrl)
        setLogoMsg(t(lang, 'Logo 已更新', 'Logo updated'))
        setLogoTone('success')
      } catch {
        setLogoMsg(t(lang, '上传失败，请重试', 'Upload failed, please try again'))
        setLogoTone('error')
      }
    })
  }

  function handleLogoRemove() {
    setLogoMsg('')
    startLogoTransition(async () => {
      try {
        await patchSettings({ logoFileId: null })
        setLogoUrl(null)
        setLogoMsg(t(lang, 'Logo 已移除', 'Logo removed'))
        setLogoTone('success')
      } catch {
        setLogoMsg(t(lang, '操作失败，请重试', 'Operation failed, please try again'))
        setLogoTone('error')
      }
    })
  }

  function handleFaviconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setFaviconMsg('')

    startFaviconTransition(async () => {
      try {
        const uploaded = await uploadFile(file, 'favicon')
        if (!uploaded) throw new Error('Upload returned no data')
        await patchSettings({ faviconFileId: uploaded.id })
        setFaviconUrl(uploaded.imageUrl)
        setFaviconMsg(t(lang, 'Favicon 已更新', 'Favicon updated'))
        setFaviconTone('success')
      } catch {
        setFaviconMsg(t(lang, '上传失败，请重试', 'Upload failed, please try again'))
        setFaviconTone('error')
      }
    })
  }

  function handleFaviconRemove() {
    setFaviconMsg('')
    startFaviconTransition(async () => {
      try {
        await patchSettings({ faviconFileId: null })
        setFaviconUrl(null)
        setFaviconMsg(t(lang, 'Favicon 已移除', 'Favicon removed'))
        setFaviconTone('success')
      } catch {
        setFaviconMsg(t(lang, '操作失败，请重试', 'Operation failed, please try again'))
        setFaviconTone('error')
      }
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Logo section */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              {t(lang, '网站 Logo', 'Site Logo')}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {t(lang, '支持 JPEG、PNG、WebP、SVG 格式', 'Supports JPEG, PNG, WebP, SVG')}
            </p>
          </div>

          {logoUrl ? (
            <div className="flex flex-col gap-3">
              <div className="relative h-24 w-48 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-400 disabled:opacity-60"
                >
                  {logoUploading ? t(lang, '上传中…', 'Uploading...') : t(lang, '更换', 'Replace')}
                </button>
                <button
                  type="button"
                  onClick={handleLogoRemove}
                  disabled={logoUploading}
                  className="rounded-full border border-rose-100 px-4 py-2 text-sm text-rose-600 transition hover:border-rose-300 disabled:opacity-60"
                >
                  {t(lang, '移除', 'Remove')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={logoUploading}
              className="flex h-24 w-full items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-sm text-stone-400 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-60"
            >
              {logoUploading ? t(lang, '上传中…', 'Uploading...') : t(lang, '点击上传 Logo', 'Click to upload logo')}
            </button>
          )}

          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoChange}
          />

          {logoMsg ? <NoticePill message={logoMsg} tone={logoTone} /> : null}
        </div>

        {/* Favicon section */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              {t(lang, 'Favicon', 'Favicon')}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {t(lang, '支持 .ico、.png 格式', 'Supports .ico and .png formats')}
            </p>
          </div>

          {faviconUrl ? (
            <div className="flex flex-col gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                <Image
                  src={faviconUrl}
                  alt="Favicon"
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={faviconUploading}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-700 transition hover:border-stone-400 disabled:opacity-60"
                >
                  {faviconUploading ? t(lang, '上传中…', 'Uploading...') : t(lang, '更换', 'Replace')}
                </button>
                <button
                  type="button"
                  onClick={handleFaviconRemove}
                  disabled={faviconUploading}
                  className="rounded-full border border-rose-100 px-4 py-2 text-sm text-rose-600 transition hover:border-rose-300 disabled:opacity-60"
                >
                  {t(lang, '移除', 'Remove')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              disabled={faviconUploading}
              className="flex h-16 w-full items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-sm text-stone-400 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-60"
            >
              {faviconUploading ? t(lang, '上传中…', 'Uploading...') : t(lang, '点击上传 Favicon', 'Click to upload favicon')}
            </button>
          )}

          <input
            ref={faviconInputRef}
            type="file"
            accept=".ico,image/png"
            className="hidden"
            onChange={handleFaviconChange}
          />

          {faviconMsg ? <NoticePill message={faviconMsg} tone={faviconTone} /> : null}
        </div>
      </div>
    </div>
  )
}
