import { redirect } from 'next/navigation'
import { AdminInfoList } from '../../../components/admin/AdminInfoList'
import { AdminPasswordForm } from '../../../components/admin/AdminPasswordForm'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminSettingsForm } from '../../../components/admin/AdminSettingsForm'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminWorkspaceLayout } from '../../../components/admin/AdminWorkspaceLayout'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminSystemSettings } from '../../../server/services/admin-settings.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const settings = await getAdminSystemSettings()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '系统设置', 'System settings')}
      subtitle={pick(lang, '这里集中放后台偏好、系统参数、管理员密码与后续可扩展的运营配置。', 'A central place for admin preferences, system parameters, password management and future operational settings.')}
    >
      <AdminWorkspaceLayout
        ratio="content-heavy"
        main={
          <AdminSectionCard
            eyebrow={pick(lang, '系统偏好', 'System preferences')}
            title={pick(lang, '基础系统配置', 'Core system configuration')}
            description={pick(lang, '把站点基础信息、预约文案和验证码设置拆成独立分区后，后台会更接近正式交付状态。', 'Splitting site basics, booking copy and captcha settings into clear zones makes the admin feel much closer to a production handoff.')}
          >
            <AdminSettingsForm lang={lang} initialSettings={settings} />
          </AdminSectionCard>
        }
        aside={
          <>
          <AdminSectionCard
            eyebrow={pick(lang, '安全设置', 'Security')}
            title={pick(lang, '管理员安全', 'Admin security')}
            description={pick(lang, '建议尽快把默认密码改掉，并为交接时的账号管理留出规范入口。', 'Change the default password early and keep a clean entry point for future account handoff and admin hygiene.')}
            tone="dark"
          >
            <AdminPasswordForm lang={lang} />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, '当前会话', 'Current session')}
            title={pick(lang, '当前登录信息', 'Current admin session')}
            description={pick(lang, '展示当前管理员的基础信息；后续还可以继续扩展为多管理员与角色体系。', 'This shows the active admin basics today and can later evolve into multi-admin roles and permissions.')}
          >
            <AdminInfoList
              items={[
                { label: pick(lang, '姓名：', 'Name: '), value: admin.name },
                { label: pick(lang, '邮箱：', 'Email: '), value: admin.email },
                { label: pick(lang, '角色：', 'Role: '), value: admin.role },
                { label: pick(lang, '状态：', 'Status: '), value: admin.isActive ? pick(lang, '启用中', 'Active') : pick(lang, '禁用', 'Inactive') },
              ]}
            />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, '运行快照', 'Runtime snapshot')}
            title={pick(lang, '当前配置快照', 'Current configuration snapshot')}
            description={pick(lang, '用一个轻量面板快速确认前台默认语言、后台默认语言、货币和验证码开关当前是什么状态。', 'Use this lightweight panel to quickly confirm the current frontend locale, admin language, currency and captcha state.')}
          >
            <AdminInfoList
              items={[
                { label: pick(lang, '前台默认语言：', 'Frontend locale: '), value: settings?.defaultFrontendLocale || 'de' },
                { label: pick(lang, '后台默认语言：', 'Admin language: '), value: settings?.adminDefaultLanguage || 'zh' },
                { label: pick(lang, '货币：', 'Currency: '), value: settings?.currency || 'EUR' },
                { label: pick(lang, '验证码：', 'Captcha: '), value: settings?.cfTurnstileEnabled ? pick(lang, '已开启', 'Enabled') : pick(lang, '已关闭', 'Disabled') },
              ]}
            />
          </AdminSectionCard>
          </>
        }
      />
    </AdminShell>
  )
}
