import { redirect } from 'next/navigation'
import { AdminSectionCard } from '../../components/admin/AdminSectionCard'
import { AdminShell } from '../../components/admin/AdminShell'
import { AdminTopSummary } from '../../components/admin/AdminTopSummary'
import { AdminWorkspaceLayout } from '../../components/admin/AdminWorkspaceLayout'
import { getCurrentAdmin } from '../../lib/auth'
import { getAdminLang, pick } from '../../lib/admin-i18n'
import { getAdminDashboardStats } from '../../server/services/admin-dashboard.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const stats = await getAdminDashboardStats()
  const lang = await getAdminLang()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '中文后台', 'Admin workspace')}
      subtitle={pick(lang, '现在已经从纯占位页推进到 dashboard MVP：先看关键数据，再逐步接预约、服务、内容和图片管理。', 'The admin is now beyond a placeholder: start with core metrics, then move into bookings, services, content and media management.')}
    >
      <AdminTopSummary
        title={pick(lang, '运营概览', 'Operations overview')}
        lang={lang}
        items={[
          { labelZh: '全部预约', labelEn: 'All bookings', value: stats.appointmentsTotal },
          { labelZh: '待处理预约', labelEn: 'Pending bookings', value: stats.pendingAppointments, tone: 'accent' },
          { labelZh: '服务项目', labelEn: 'Services', value: stats.servicesTotal },
          { labelZh: '已发布评价', labelEn: 'Published testimonials', value: stats.testimonialsTotal },
        ]}
      />

      <div className="mt-8">
        <AdminWorkspaceLayout
          main={
            <AdminSectionCard eyebrow="Roadmap" title="模块路线图" description="把后台六大模块整理成更稳定的运营工作台结构。">
              <div className="grid gap-4">
                {[
                  { title: pick(lang, '预约管理', 'Bookings'), desc: pick(lang, '查看预约、改状态、写备注、确认完成（下一步继续补完整操作）', 'Review bookings, update statuses, add notes and handle completion workflows.') },
                  { title: pick(lang, '服务项目', 'Services'), desc: pick(lang, '新增、编辑、上下架、排序、封面图', 'Create, edit, publish, reorder and refine the service catalog.') },
                  { title: pick(lang, '网站内容', 'Content'), desc: pick(lang, '首页文案、联系信息、FAQ、SEO', 'Maintain hero copy, contact info, FAQ and site-facing content.') },
                  { title: pick(lang, '图片管理', 'Media'), desc: pick(lang, '图库上传、替换、alt 文本、排序', 'Handle gallery uploads, replacement, alt text and media ordering.') },
                ].map((item) => (
                  <div key={item.title} className="rounded-3xl border border-stone-100 bg-[linear-gradient(180deg,#fff_0%,#fcfbf9_100%)] p-5">
                    <h3 className="font-semibold text-stone-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </AdminSectionCard>
          }
          aside={
            <AdminSectionCard eyebrow="Positioning" title="当前后台定位" description="当前重点是把后台持续收口成更稳定的运营系统。" tone="dark">
              <div className="space-y-4 text-sm leading-7 text-stone-300">
                <p>这一步的目标不是一次性做完后台，而是先把“能连接真实数据的运营入口”搭起来。</p>
                <p>现在 dashboard 已经读取数据库计数，说明后台页面和数据层已经打通。</p>
                <p>当前已经具备：登录保护、预约管理、服务管理、内容管理、图库上传。</p>
              </div>
            </AdminSectionCard>
          }
        />
      </div>
    </AdminShell>
  )
}
