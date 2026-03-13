import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { AdminShell } from '../../components/admin/AdminShell'
import { AdminTopSummary } from '../../components/admin/AdminTopSummary'
import { getCurrentAdmin } from '../../lib/auth'
import { getAdminLang, pick } from '../../lib/admin-i18n'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardStats() {
  if (!process.env.DATABASE_URL) {
    return {
      appointmentsTotal: 0,
      pendingAppointments: 0,
      servicesTotal: 0,
      testimonialsTotal: 0,
    }
  }

  const [appointmentsTotal, pendingAppointments, servicesTotal, testimonialsTotal] = await Promise.all([
    prisma.appointment.count().catch(() => 0),
    prisma.appointment.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.service.count().catch(() => 0),
    prisma.testimonial.count({ where: { isPublished: true } }).catch(() => 0),
  ])

  return { appointmentsTotal, pendingAppointments, servicesTotal, testimonialsTotal }
}

export default async function AdminPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const stats = await getDashboardStats()
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_18px_50px_rgba(28,25,23,0.08)] sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">Roadmap</p>
              <h2 className="mt-2 text-lg font-semibold text-stone-900">模块路线图</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4">
            {[
              { title: '预约管理', desc: '查看预约、改状态、写备注、确认完成（下一步继续补完整操作）' },
              { title: '服务项目', desc: '新增、编辑、上下架、排序、封面图' },
              { title: '网站内容', desc: '首页文案、联系信息、FAQ、SEO' },
              { title: '图片管理', desc: '图库上传、替换、alt 文本、排序' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-stone-100 bg-[linear-gradient(180deg,#fff_0%,#fcfbf9_100%)] p-5">
                <h3 className="font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-stone-200 bg-[#201a17] p-6 text-stone-100 shadow-[0_18px_50px_rgba(28,25,23,0.18)] sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">Positioning</p>
          <h2 className="mt-2 text-lg font-semibold text-white">当前后台定位</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-stone-300">
            <p>这一步的目标不是一次性做完后台，而是先把“能连接真实数据的运营入口”搭起来。</p>
            <p>现在 dashboard 已经读取数据库计数，说明后台页面和数据层已经打通。</p>
            <p>当前已经具备：登录保护、预约管理、服务管理、内容管理、图库上传。</p>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
