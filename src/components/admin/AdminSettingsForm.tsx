'use client'

import { useState, useTransition } from 'react'
import { adminRequest } from '../../lib/admin-request'
import { NoticePill } from './NoticePill'

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
  bookingRateLimitWindowMin: number
  bookingRateLimitMaxRequests: number
  seoTitleTemplateDe: string
  seoTitleTemplateEn: string
  seoMetaDescriptionDe: string
  seoMetaDescriptionEn: string
  featureEnableEmailReminders: boolean
  featureEnableBookingManage: boolean
  featureEnableWhatsappReminders: boolean
  privacyConsentRequired: boolean
  bookingRetentionDays: number
  allowDeletionRequests: boolean
}

type NoticeTone = 'success' | 'error'

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
    bookingRateLimitWindowMin: Number(initialSettings?.bookingRateLimitWindowMin) || 15,
    bookingRateLimitMaxRequests: Number(initialSettings?.bookingRateLimitMaxRequests) || 3,
    seoTitleTemplateDe: initialSettings?.seoTitleTemplateDe || '',
    seoTitleTemplateEn: initialSettings?.seoTitleTemplateEn || '',
    seoMetaDescriptionDe: initialSettings?.seoMetaDescriptionDe || '',
    seoMetaDescriptionEn: initialSettings?.seoMetaDescriptionEn || '',
    featureEnableEmailReminders: initialSettings?.featureEnableEmailReminders !== false,
    featureEnableBookingManage: initialSettings?.featureEnableBookingManage !== false,
    featureEnableWhatsappReminders: Boolean(initialSettings?.featureEnableWhatsappReminders),
    privacyConsentRequired: initialSettings?.privacyConsentRequired !== false,
    bookingRetentionDays: Number(initialSettings?.bookingRetentionDays) || 180,
    allowDeletionRequests: Boolean(initialSettings?.allowDeletionRequests),
  })
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
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
        setMessageTone('success')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : t(lang, '保存设置失败', 'Failed to save settings'))
        setMessageTone('error')
      }
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '站点基本信息', 'Site basics')}</h3>
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
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '预约与文案配置', 'Booking and copy settings')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '管理不同语言下的预约说明，让前台预约页面文案可控。', 'Manage booking notices in each locale so the booking page copy stays configurable.')}</p>
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
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '验证码防护', 'Cloudflare Turnstile / Captcha')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '默认关闭。只有开启后，预约提交才会要求验证码校验。', 'Disabled by default. Booking submissions will require captcha verification only when enabled.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
            <input type="checkbox" checked={form.cfTurnstileEnabled} onChange={(e) => setForm({ ...form, cfTurnstileEnabled: e.target.checked })} />
            {t(lang, '启用验证码校验', 'Enable Turnstile verification')}
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '站点密钥', 'Site key')}</span>
            <input value={form.cfTurnstileSiteKey} onChange={(e) => setForm({ ...form, cfTurnstileSiteKey: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="0x4AAAA..." />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '私密密钥', 'Secret key')}</span>
            <input value={form.cfTurnstileSecretKey} onChange={(e) => setForm({ ...form, cfTurnstileSecretKey: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="0x4AAAA..." />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '频率限制窗口（分钟）', 'Rate-limit window (minutes)')}</span>
            <input type="number" min="1" max="1440" value={form.bookingRateLimitWindowMin} onChange={(e) => setForm({ ...form, bookingRateLimitWindowMin: Number(e.target.value) || 15 })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '窗口内最大预约次数', 'Max bookings per window')}</span>
            <input type="number" min="1" max="20" value={form.bookingRateLimitMaxRequests} onChange={(e) => setForm({ ...form, bookingRateLimitMaxRequests: Number(e.target.value) || 3 })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, 'SEO 设置', 'SEO settings')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '把 SEO 标题模板与站点默认描述收成可配置项，为后续服务页和合规页扩展打基础。', 'Turn SEO title templates and default meta descriptions into configurable fields to support service pages and compliance pages later.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, 'SEO 标题模板（德语）', 'SEO title template (German)')}</span>
            <input value={form.seoTitleTemplateDe} onChange={(e) => setForm({ ...form, seoTitleTemplateDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder={t(lang, '例如：{page} | China TCM Massage München', 'Example: {page} | China TCM Massage München')} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, 'SEO 标题模板（英文）', 'SEO title template (English)')}</span>
            <input value={form.seoTitleTemplateEn} onChange={(e) => setForm({ ...form, seoTitleTemplateEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder={t(lang, 'Example: {page} | China TCM Massage Munich', 'Example: {page} | China TCM Massage Munich')} />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '默认描述（德语）', 'Default meta description (German)')}</span>
            <textarea rows={4} value={form.seoMetaDescriptionDe} onChange={(e) => setForm({ ...form, seoMetaDescriptionDe: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '默认描述（英文）', 'Default meta description (English)')}</span>
            <textarea rows={4} value={form.seoMetaDescriptionEn} onChange={(e) => setForm({ ...form, seoMetaDescriptionEn: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '功能开关', 'Feature flags')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '先把 MVP 级的功能开关正式落成结构化配置，后续接页面和逻辑会更快。', 'Turn MVP feature policy into structured settings now so later UI and logic work can attach much faster.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={form.featureEnableEmailReminders} onChange={(e) => setForm({ ...form, featureEnableEmailReminders: e.target.checked })} />
            {t(lang, '启用邮件提醒', 'Enable email reminders')}
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={form.featureEnableBookingManage} onChange={(e) => setForm({ ...form, featureEnableBookingManage: e.target.checked })} />
            {t(lang, '启用客户自助改约/取消', 'Enable self-service booking management')}
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
            <input type="checkbox" checked={form.featureEnableWhatsappReminders} onChange={(e) => setForm({ ...form, featureEnableWhatsappReminders: e.target.checked })} />
            {t(lang, '启用 WhatsApp 提醒（预留）', 'Enable WhatsApp reminders (reserved)')}
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '隐私与合规', 'Privacy & compliance')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '先把隐私同意、保留期与删除请求开关落成配置项，为后续真正实现数据治理留接口。', 'Turn privacy consent, retention period and deletion-request policy into structured settings now so later compliance work has a real configuration base.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-stone-700 md:col-span-2">
            <input type="checkbox" checked={form.privacyConsentRequired} onChange={(e) => setForm({ ...form, privacyConsentRequired: e.target.checked })} />
            {t(lang, '预约时要求隐私同意', 'Require privacy consent during booking')}
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '预约数据保留天数', 'Booking retention days')}</span>
            <input type="number" min="1" max="3650" value={form.bookingRetentionDays} onChange={(e) => setForm({ ...form, bookingRetentionDays: Number(e.target.value) || 180 })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={form.allowDeletionRequests} onChange={(e) => setForm({ ...form, allowDeletionRequests: e.target.checked })} />
            {t(lang, '允许客户发起删除请求（预留）', 'Allow deletion requests (reserved)')}
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={isPending} className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
          {isPending ? t(lang, '保存中…', 'Saving...') : t(lang, '保存系统设置', 'Save settings')}
        </button>
        {message ? <NoticePill message={message} tone={messageTone} /> : null}
      </div>
    </div>
  )
}
