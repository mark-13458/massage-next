import { redirect } from 'next/navigation'
import Link from 'next/link'
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
                { label: pick(lang, '邮件提醒：', 'Email reminders: '), value: settings?.featureEnableEmailReminders === false ? pick(lang, '关闭', 'Disabled') : pick(lang, '开启', 'Enabled') },
                { label: pick(lang, '客户自助改约：', 'Self-service manage: '), value: settings?.featureEnableBookingManage === false ? pick(lang, '关闭', 'Disabled') : pick(lang, '开启', 'Enabled') },
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
                { label: pick(lang, '邮件提醒：', 'Email reminders: '), value: settings?.featureEnableEmailReminders === false ? pick(lang, '当前关闭', 'Currently disabled') : pick(lang, '当前开启', 'Currently enabled') },
                { label: pick(lang, '客户自助改约：', 'Booking self-service: '), value: settings?.featureEnableBookingManage === false ? pick(lang, '当前关闭', 'Currently disabled') : pick(lang, '当前开启', 'Currently enabled') },
                { label: pick(lang, 'WhatsApp 提醒：', 'WhatsApp reminders: '), value: settings?.featureEnableWhatsappReminders ? pick(lang, '当前开启', 'Currently enabled') : pick(lang, '当前关闭', 'Currently disabled') },
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
                { label: pick(lang, '防刷策略：', 'Anti-abuse policy: '), value: pick(lang, '✓ 手机号/邮箱频率限制已实现', '✓ Phone/email rate limits implemented') },
                { label: pick(lang, '登录防护：', 'Login protection: '), value: pick(lang, '✓ 失败次数限制已实现', '✓ Failed attempt limits implemented') },
                { label: pick(lang, '操作日志：', 'Audit logs: '), value: pick(lang, '✓ 预约与登录操作记录已实现', '✓ Booking & login audit logs implemented') },
                { label: pick(lang, '下一步：', 'Next: '), value: pick(lang, '改约/取消 token 安全链接', 'Secure reschedule/cancel token links') },
              ]}
            />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, '安全执行清单', 'Security execution checklist')}
            title={pick(lang, '优先级与已实现项', 'Priorities & implemented features')}
            description={pick(lang, '把已落地的安全防护与下一阶段工作整理成清单。', 'Organized list of implemented security features and next priorities.')}
          >
            <AdminInfoList
              items={[
                { label: '✓ P1：', value: pick(lang, '预约频率限制 (手机号/邮箱) + 登录防暴力', 'Booking rate limits (phone/email) + login brute-force protection') },
                { label: '✓ P2：', value: pick(lang, '操作审计日志 (所有关键事件记录)', 'Audit logs (all critical events tracked)') },
                { label: '✓ P3：', value: pick(lang, '改约/取消安全 token 链接', 'Secure reschedule/cancel token links') },
                { label: '✓ P4：', value: pick(lang, '隐私同意、数据保留与删除机制', 'Privacy consent, retention and deletion workflow') },
              ]}
            />
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, '审计与监控', 'Audit & monitoring')}
            title={pick(lang, '操作日志查看', 'Audit log access')}
            description={pick(lang, '直接查看系统关键事件日志：预约操作、管理员操作、登录记录等。', 'Direct access to system audit logs: booking operations, admin actions, login records and more.')}
          >
            <div className="space-y-3">
              <Link
                href="/admin/settings/audit-logs"
                className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400"
              >
                <span>{pick(lang, '查看完整操作日志', 'View full audit logs')}</span>
                <span className="text-stone-500">→</span>
              </Link>
              <Link
                href="/admin/settings/audit-logs?action=BOOKING_CREATED"
                className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400"
              >
                <span>{pick(lang, '预约创建记录', 'Booking creation logs')}</span>
                <span className="text-stone-500">→</span>
              </Link>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, 'SEO 与合规', 'SEO & compliance')}
            title={pick(lang, 'SEO / 隐私待办', 'SEO / privacy checklist')}
            description={pick(lang, '把不会立刻破坏当前系统、但必须逐步补齐的 SEO 与合规项集中展示。', 'Surface the SEO and compliance follow-ups that should be added progressively without overloading the MVP.')}
          >
            <AdminInfoList
              items={[
                { label: pick(lang, 'SEO 页面：', 'SEO pages: '), value: pick(lang, 'Impressum / Datenschutzerklärung 仍需继续收口与运营化', 'Impressum / Datenschutz pages still need further productization and operations polish') },
                { label: pick(lang, '预约合规：', 'Booking compliance: '), value: settings?.privacyConsentRequired === false ? pick(lang, '当前未强制隐私同意，建议尽快补齐', 'Privacy consent is not enforced now and should be added soon') : pick(lang, '已要求隐私同意，下一步补真实流程', 'Privacy consent is required; next step is real workflow support') },
                { label: pick(lang, '数据保留：', 'Retention: '), value: pick(lang, `当前配置为 ${settings?.bookingRetentionDays || 180} 天`, `Currently set to ${settings?.bookingRetentionDays || 180} days`) },
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
