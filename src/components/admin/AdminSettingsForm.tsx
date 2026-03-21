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
  frontendTheme: 'classic' | 'zen'
  smtpHost: string
  smtpPort: number
  smtpSecure: boolean
  smtpUser: string
  smtpPass: string
  smtpFrom: string
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
    frontendTheme: (initialSettings as Record<string, unknown>)?.frontendTheme === 'zen' ? 'zen' : 'classic',
    smtpHost: (initialSettings as Record<string, unknown>)?.smtpHost as string || '',
    smtpPort: Number((initialSettings as Record<string, unknown>)?.smtpPort) || 587,
    smtpSecure: Boolean((initialSettings as Record<string, unknown>)?.smtpSecure),
    smtpUser: (initialSettings as Record<string, unknown>)?.smtpUser as string || '',
    smtpPass: (initialSettings as Record<string, unknown>)?.smtpPass as string || '',
    smtpFrom: (initialSettings as Record<string, unknown>)?.smtpFrom as string || '',
  })
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<NoticeTone>('success')
  const [isPending, startTransition] = useTransition()
  const [testEmailPending, setTestEmailPending] = useState(false)
  const [testEmailTo, setTestEmailTo] = useState('')
  const [testEmailMsg, setTestEmailMsg] = useState('')
  const [testEmailTone, setTestEmailTone] = useState<NoticeTone>('success')
  const [cleanupPending, setCleanupPending] = useState(false)

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

  async function sendTestEmail() {
    setTestEmailMsg('')
    setTestEmailPending(true)
    try {
      const res = await adminRequest<{ message?: string }>('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailTo.trim() || undefined }),
      })
      setTestEmailMsg(res?.message || t(lang, '测试邮件已发送，请查收', 'Test email sent, please check inbox'))
      setTestEmailTone('success')
    } catch (error) {
      setTestEmailMsg(error instanceof Error ? error.message : t(lang, '发送测试邮件失败', 'Failed to send test email'))
      setTestEmailTone('error')
    } finally {
      setTestEmailPending(false)
    }
  }

  async function runCleanup() {
    if (!confirm(t(lang, '确定要立即清理超过保留期限的历史预约吗？此操作不可恢复。', 'Are you sure you want to purge bookings older than the retention period? This cannot be undone.'))) return
    
    setMessage('')
    setCleanupPending(true)
    try {
      const res = await adminRequest('/api/admin/system/cleanup', { method: 'POST' })
      const data = await res.json()
      setMessage(t(lang, `清理完成，共删除 ${data.deletedCount} 条历史数据。`, `Cleanup complete, deleted ${data.deletedCount} historical records.`))
      setMessageTone('success')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t(lang, '执行清理失败', 'Failed to run cleanup'))
      setMessageTone('error')
    } finally {
      setCleanupPending(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '站点基本信息', 'Site basics')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '管理前台默认语言、品牌名称、时区和货币。', 'Manage the default frontend locale, brand name, timezone and currency.')}</p>
          <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-500">
            <span className="font-semibold text-stone-700">{t(lang, '💡 提示：', '💡 Tip: ')}</span>
            {t(lang, '如需修改电话、邮箱、地址或营业时间，请前往 ', 'To update phone, email, address or business hours, please go to ')}
            <a href="/admin/content" className="font-medium text-amber-600 underline hover:text-amber-700">{t(lang, '内容管理', 'Content Management')}</a>
            。
          </div>
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
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '前台主题', 'Frontend theme')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '选择前台网站的视觉风格。切换后前台首页立即生效。', 'Choose the visual style for the frontend website. Changes take effect immediately on the homepage.')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={`flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-4 transition ${form.frontendTheme === 'classic' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
            <input type="radio" name="frontendTheme" value="classic" checked={form.frontendTheme === 'classic'} onChange={() => setForm({ ...form, frontendTheme: 'classic' })} className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#3e2723]">
                <span className="text-sm font-bold text-amber-300">C</span>
              </div>
              <div>
                <p className="font-semibold text-stone-900">{t(lang, 'Classic（暖棕色）', 'Classic (Warm Brown)')}</p>
                <p className="text-xs text-stone-500">{t(lang, '当前主题，暖棕色调，衬线字体，卡片式布局', 'Current theme, warm brown tones, serif font, card layout')}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="h-4 w-4 rounded-full bg-[#3e2723]" title="#3e2723" />
              <span className="h-4 w-4 rounded-full bg-[#fdfaf6]" title="#fdfaf6" />
              <span className="h-4 w-4 rounded-full bg-[#f59e0b]" title="amber" />
            </div>
          </label>

          <label className={`flex cursor-pointer flex-col gap-3 rounded-2xl border-2 p-4 transition ${form.frontendTheme === 'zen' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
            <input type="radio" name="frontendTheme" value="zen" checked={form.frontendTheme === 'zen'} onChange={() => setForm({ ...form, frontendTheme: 'zen' })} className="sr-only" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#9B7E5C]">
                <span className="text-sm font-bold text-white">Z</span>
              </div>
              <div>
                <p className="font-semibold text-stone-900">{t(lang, 'Zen Oase（米色简约）', 'Zen Oase (Minimal Beige)')}</p>
                <p className="text-xs text-stone-500">{t(lang, '全屏 Hero 图片，米色背景，无衬线字体，简约风格', 'Full-screen hero image, beige background, sans-serif, minimal style')}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="h-4 w-4 rounded-full bg-[#9B7E5C]" title="#9B7E5C" />
              <span className="h-4 w-4 rounded-full bg-[#FAF8F5]" title="#FAF8F5" />
              <span className="h-4 w-4 rounded-full bg-[#E8DFD4]" title="#E8DFD4" />
            </div>
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
          <h3 className="text-base font-semibold text-stone-900">{t(lang, '邮件 SMTP 配置', 'Email SMTP configuration')}</h3>
          <p className="mt-1 text-sm text-stone-600">{t(lang, '配置邮件发送服务器，用于预约确认、提醒等邮件。DB 配置优先于环境变量。', 'Configure the mail server for booking confirmations and reminders. DB settings take priority over environment variables.')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, 'SMTP 服务器地址', 'SMTP host')}</span>
            <input value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="smtp.gmail.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '端口', 'Port')}</span>
            <input type="number" min="1" max="65535" value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) || 587 })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '用户名（邮箱）', 'Username (email)')}</span>
            <input type="email" value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="you@example.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '密码 / 应用专用密码', 'Password / App password')}</span>
            <input type="password" value={form.smtpPass} onChange={(e) => setForm({ ...form, smtpPass: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="••••••••" autoComplete="new-password" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '发件人地址（留空则同用户名）', 'From address (defaults to username)')}</span>
            <input type="email" value={form.smtpFrom} onChange={(e) => setForm({ ...form, smtpFrom: e.target.value })} className="rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="noreply@example.com" />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone-700 self-end pb-3">
            <input type="checkbox" checked={form.smtpSecure} onChange={(e) => setForm({ ...form, smtpSecure: e.target.checked })} />
            {t(lang, '使用 SSL/TLS（端口 465）', 'Use SSL/TLS (port 465)')}
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-stone-100 pt-4">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span>{t(lang, '测试收件地址（留空则发到管理员邮箱）', 'Test recipient (leave blank to send to admin email)')}</span>
            <input
              type="email"
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              placeholder={t(lang, '例如：you@example.com', 'e.g. you@example.com')}
              className="w-72 rounded-2xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <button
            type="button"
            onClick={sendTestEmail}
            disabled={testEmailPending}
            className="rounded-full border border-amber-400 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
          >
            {testEmailPending ? t(lang, '发送中…', 'Sending...') : t(lang, '发送测试邮件', 'Send test email')}
          </button>
          {testEmailMsg ? <NoticePill message={testEmailMsg} tone={testEmailTone} /> : null}
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
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-stone-500">{t(lang, '超过此天数的历史预约将被系统自动清理（建议 180 天）。', 'Bookings older than this will be auto-purged (recommended 180 days).')}</p>
              <button 
                type="button" 
                onClick={runCleanup} 
                disabled={cleanupPending} 
                className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {cleanupPending ? '...' : t(lang, '立即执行清理', 'Run cleanup now')}
              </button>
            </div>
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
