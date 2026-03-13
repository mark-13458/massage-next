import { redirect } from 'next/navigation'
import { AdminPasswordForm } from '../../../components/admin/AdminPasswordForm'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminSettingsForm } from '../../../components/admin/AdminSettingsForm'
import { AdminShell } from '../../../components/admin/AdminShell'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getSystemSettings() {
  if (!process.env.DATABASE_URL) return null
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'adminSystemSettings' } })
    if (!setting?.value || typeof setting.value !== 'object' || Array.isArray(setting.value)) return null
    return setting.value as Record<string, any>
  } catch {
    return null
  }
}

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const settings = await getSystemSettings()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '系统设置', 'System settings')}
      subtitle={pick(lang, '这里集中放后台偏好、系统参数、管理员密码与后续可扩展的运营配置。', 'A central place for admin preferences, system parameters, password management and future operational settings.')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <AdminSectionCard
            eyebrow={pick(lang, 'System Preferences', 'System Preferences')}
            title={pick(lang, '基础系统配置', 'Core system configuration')}
            description={pick(lang, '把站点基础信息、预约文案和验证码设置拆成独立分区后，后台会更接近正式交付状态。', 'Splitting site basics, booking copy and captcha settings into clear zones makes the admin feel much closer to a production handoff.')}
          >
            <AdminSettingsForm lang={lang} initialSettings={settings} />
          </AdminSectionCard>
        </div>

        <div className="space-y-6">
          <AdminSectionCard
            eyebrow={pick(lang, 'Security', 'Security')}
            title={pick(lang, '管理员安全', 'Admin security')}
            description={pick(lang, '建议尽快把默认密码改掉，并为交接时的账号管理留出规范入口。', 'Change the default password early and keep a clean entry point for future account handoff and admin hygiene.')}
            tone="dark"
          >
            <AdminPasswordForm lang={lang} />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, 'Current Session', 'Current Session')}
            title={pick(lang, '当前登录信息', 'Current admin session')}
            description={pick(lang, '展示当前管理员的基础信息；后续还可以继续扩展为多管理员与角色体系。', 'This shows the active admin basics today and can later evolve into multi-admin roles and permissions.')}
          >
            <div className="grid gap-4 text-sm text-stone-700">
              <div><span className="font-semibold text-stone-900">{pick(lang, '姓名：', 'Name: ')}</span>{admin.name}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '邮箱：', 'Email: ')}</span>{admin.email}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '角色：', 'Role: ')}</span>{admin.role}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '状态：', 'Status: ')}</span>{admin.isActive ? pick(lang, '启用中', 'Active') : pick(lang, '禁用', 'Inactive')}</div>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, 'Runtime Snapshot', 'Runtime Snapshot')}
            title={pick(lang, '当前配置快照', 'Current configuration snapshot')}
            description={pick(lang, '用一个轻量面板快速确认前台默认语言、后台默认语言、货币和验证码开关当前是什么状态。', 'Use this lightweight panel to quickly confirm the current frontend locale, admin language, currency and captcha state.')}
          >
            <div className="grid gap-3 text-sm text-stone-700">
              <div><span className="font-semibold text-stone-900">{pick(lang, '前台默认语言：', 'Frontend locale: ')}</span>{settings?.defaultFrontendLocale || 'de'}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '后台默认语言：', 'Admin language: ')}</span>{settings?.adminDefaultLanguage || 'zh'}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '货币：', 'Currency: ')}</span>{settings?.currency || 'EUR'}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '验证码：', 'Captcha: ')}</span>{settings?.cfTurnstileEnabled ? pick(lang, '已开启', 'Enabled') : pick(lang, '已关闭', 'Disabled')}</div>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </AdminShell>
  )
}
