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
      subtitle={pick(lang, '这里集中放后台偏好、系统参数、管理员密码与后续可扩展的运营配置项。', 'A central place for admin preferences, system parameters, password management and future operational settings.')}
    >
      <AdminWorkspaceLayout
        ratio="content-heavy"
        main={
          <AdminSectionCard
            eyebrow={pick(lang, '系统偏好', 'System preferences')}
            title={pick(lang, '基础系统设置', 'Core system configuration')}
            description={pick(lang, '把站点基本信息、预约文案和验证码设置拆成独立分区后，后台会更接近正式可交付状态。', 'Splitting site basics, booking copy and captcha settings into clear zones makes the admin feel much closer to a production handoff.')}
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
            eyebrow={pick(lang, '当前配置', 'Runtime snapshot')}
            title={pick(lang, '当前配置概览', 'Current configuration snapshot')}
            description={pick(lang, '用一个轻量面板快速确认前台默认语言、后台默认语言、货币和验证码开关当前状态。', 'Use this lightweight panel to quickly confirm the current frontend locale, admin language, currency and captcha state.')}
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

          <AdminSectionCard
            eyebrow={pick(lang, '功能开关', 'Feature flags')}
            title={pick(lang, '默认功能策略', 'Default feature policy')}
            description={pick(lang, '结合当前项目定位，把 MVP 应默认开启与默认关闭的能力先清晰展示出来。', 'Make the MVP feature policy explicit so the admin reflects which capabilities should be on now and which stay reserved for later.')}
          >
            <AdminInfoList
              items={[
                { label: pick(lang, '默认开启：', 'Enabled by default: '), value: pick(lang, '官网展示 / 在线预约 / 邮件提醒预留 / 改约取消 / 基础 SEO / 基础验证码能力', 'Website / online booking / email reminder readiness / reschedule & cancel / baseline SEO / baseline captcha capability') },
                { label: pick(lang, '默认关闭：', 'Disabled by default: '), value: pick(lang, '在线支付 / 优惠券 / 会员系统 / WhatsApp 自动提醒 / 营销活动 / 强制 2FA', 'Online payments / coupons / membership / WhatsApp auto-reminders / campaigns / enforced 2FA') },
              ]}
            />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, '预约防护', 'Booking protection')}
            title={pick(lang, '预约安全待办', 'Booking security checklist')}
            description={pick(lang, '把预约防刷、防恶意预约和数据安全相关事项先明确挂到后台治理面板里。', 'Surface anti-abuse, booking protection and data-safety follow-ups in the admin governance layer before implementing heavier backend logic.')}
          >
            <AdminInfoList
              items={[
                { label: pick(lang, '防刷策略：', 'Anti-abuse policy: '), value: pick(lang, '验证码、IP 频率限制、手机号/邮箱频率限制应作为下一批优先能力', 'Captcha, IP throttling and phone/email rate limits should be prioritized next') },
                { label: pick(lang, '改约/取消：', 'Reschedule / cancel: '), value: pick(lang, '建议补安全 token 链接与异常预约识别机制', 'Secure token links and abnormal-booking detection should be added') },
                { label: pick(lang, '数据最少化：', 'Data minimization: '), value: pick(lang, '当前仅围绕姓名、电话、邮箱继续设计存储与删除策略', 'Continue designing storage and deletion policy around name, phone and email only') },
              ]}
            />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, 'SEO 与合规', 'SEO & compliance')}
            title={pick(lang, 'SEO / 隐私待办', 'SEO / privacy checklist')}
            description={pick(lang, '把不会立刻破坏当前系统、但必须逐步补齐的 SEO 与合规项集中展示。', 'Surface the SEO and compliance follow-ups that should be added progressively without overloading the MVP.')}
          >
            <AdminInfoList
              items={[
                { label: pick(lang, 'SEO 页面：', 'SEO pages: '), value: pick(lang, 'Impressum / Datenschutzerklärung 仍需继续收口与运营化', 'Impressum / Datenschutz pages still need further productization and operations polish') },
                { label: pick(lang, '预约合规：', 'Booking compliance: '), value: pick(lang, '隐私同意、数据保留、删除机制建议纳入下一批后台能力', 'Privacy consent, retention and deletion workflow should be added in upcoming admin phases') },
                { label: pick(lang, '安全平衡：', 'Security balance: '), value: pick(lang, '公开页面保持可索引，后台与敏感接口保持不可索引', 'Public pages remain indexable while admin and sensitive endpoints stay non-indexable') },
              ]}
            />
          </AdminSectionCard>
          </>
        }
      />
    </AdminShell>
  )
}
