import { redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { AdminShell } from '../../components/admin/AdminShell'
import { AdminTopSummary } from '../../components/admin/AdminTopSummary'
import { getCurrentAdmin } from '../../lib/auth'

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

  return (
    <AdminShell title="中文后台" subtitle="现在已经从纯占位页推进到 dashboard MVP：先看关键数据，再逐步接预约、服务、内容和图片管理。">
      <AdminTopSummary
        title="运营概览"
        items={[
          { label: '全部预约', value: stats.appointmentsTotal },
          { label: '待处理预约', value: stats.pendingAppointments, tone: 'accent' },
          { label: '服务项目', value: stats.servicesTotal },
          { label: '已发布评价', value: stats.testimonialsTotal },
        ]}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">模块路线图</h2>
          <div className="mt-4 grid gap-4">
            {[
              { title: '预约管理', desc: '查看预约、改状态、写备注、确认完成（下一步继续补完整操作）' },
              { title: '服务项目', desc: '新增、编辑、上下架、排序、封面图' },
              { title: '网站内容', desc: '首页文案、联系信息、FAQ、SEO' },
              { title: '图片管理', desc: '图库上传、替换、alt 文本、排序' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-stone-100 p-4">
                <h3 className="font-semibold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">当前后台定位</h2>
          <div className="mt-4 space-y-4 text-sm leading-7 text-stone-600">
            <p>这一步的目标不是一次性做完后台，而是先把“能连接真实数据的运营入口”搭起来。</p>
            <p>现在 dashboard 已经读取数据库计数，说明后台页面和数据层已经打通。</p>
            <p>当前已经具备：登录保护、预约管理、服务管理、内容管理、图库上传。</p>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
