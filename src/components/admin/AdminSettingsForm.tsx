'use client'

import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'

type AdminLang = 'zh' | 'en'

type Settings = {
  siteName: string
  adminEmail: string
  defaultFrontendLocale: 'de' | 'en'
  adminDefaultLanguage: AdminLang
  timezone: string
  currency: string
  bookingNoticeDe: string
  bookingNoticeEn: string
  cfTurnstileEnabled: boolean
  cfTurnstileSiteKey: string
  cfTurnstileSecretKey: string
}

function t(lang: AdminLang, zh: string, en: string) {
  return lang === 'en' ? en : zh
}

export function AdminSettingsForm({ lang, initialSettings }: { lang: AdminLang; initialSettings: Partial<Settings & { bookingNoticeZh?: string }> | null }) {
  const [form, setForm] = useState<Settings>({
    siteName: initialSettings?.siteName || 'China TCM Massage',
    adminEmail: initialSettings?.adminEmail || '',
    defaultFrontendLocale: initialSettings?.defaultFrontendLocale === 'en' ? 'en' : 'de',
    adminDefaultLanguage: initialSettings?.adminDefaultLanguage === 'en' ? 'en' : 'zh',
    timezone: initialSettings?.timezone || 'Europe/Berlin',
    currency: initialSettings?.currency || 'EUR',
    bookingNoticeDe: initialSettings?.bookingNoticeDe || initialSettings?.bookingNoticeZh || '',
    bookingNoticeEn: initialSettings?.bookingNoticeEn || '',
    cfTurnstileEnabled: Boolean(initialSettings?.cfTurnstileEnabled),
    cfTurnstileSiteKey: initialSettings?.cfTurnstileSiteKey || '',
    cfTurnstileSecretKey: initialSettings?.cfTurnstileSecretKey || '',
  })
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function save() {
    setMessage('')
    startTransition(async () => {
      try {
        await adminRequest('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        setMessage(t(lang, '系统设置已保存', 'Settings saved'))
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '保存设置失败', 'Failed to save settings'))
      }
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '站点基础信息', 'Site basics')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '管理前台默认语言、品牌名称、时区和货币。', 'Manage the default frontend locale, brand name, timezone and currency.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '网站名称', 'Site name')}</span>
            <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '后台通知邮箱', 'Admin email')}</span>
            <input value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '默认前台语言', 'Default frontend locale')}</span>
            <select value={form.defaultFrontendLocale} onChange={(e) => setForm({ ...form, defaultFrontendLocale: e.target.value === 'en' ? 'en' : 'de' })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500">
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '后台默认语言', 'Default admin language')}</span>
            <select value={form.adminDefaultLanguage} onChange={(e) => setForm({ ...form, adminDefaultLanguage: e.target.value === 'en' ? 'en' : 'zh' })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '时区', 'Timezone')}</span>
            <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '货币', 'Currency')}</span>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '预约与文案设置', 'Booking and copy settings')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '管理不同语言下的预约说明，让前台 booking 页面文案可控。', 'Manage booking notices in each locale so the booking page copy stays configurable.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '预约说明（德语）', 'Booking notice (German)')}</span>
            <textarea rows={5} value={form.bookingNoticeDe} onChange={(e) => setForm({ ...form, bookingNoticeDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '预约说明（英文）', 'Booking notice (English)')}</span>
            <textarea rows={5} value={form.bookingNoticeEn} onChange={(e) => setForm({ ...form, bookingNoticeEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, 'Cloudflare Turnstile / 验证码', 'Cloudflare Turnstile / Captcha')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '默认关闭。只有开启后，预约提交才会要求验证码校验。', 'Disabled by default. Booking submissions will require captcha verification only when enabled.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
            <input type="checkbox" checked={form.cfTurnstileEnabled} onChange={(e) => setForm({ ...form, cfTurnstileEnabled: e.target.checked })} />
            {t(lang, '启用 Turnstile 验证', 'Enable Turnstile verification')}
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '站点 Key', 'Site key')}</span>
            <input value={form.cfTurnstileSiteKey} onChange={(e) => setForm({ ...form, cfTurnstileSiteKey: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="0x4AAAA..." />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '密钥 Secret', 'Secret key')}</span>
            <input value={form.cfTurnstileSecretKey} onChange={(e) => setForm({ ...form, cfTurnstileSecretKey: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="0x4AAAA..." />
          </label>
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="button" onClick={save} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '保存中…', 'Saving...') : t(lang, '保存系统设置', 'Save settings')}
        </button>
        {message ? <span className="text-sm text-stone-500">{message}</span> : null}
      </div>
    </div>
  )
}
