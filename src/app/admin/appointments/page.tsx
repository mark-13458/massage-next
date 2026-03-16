import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AppointmentStatus } from '@prisma/client'
import { AdminListFrame } from '../../../components/admin/AdminListFrame'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AppointmentStatusControls } from '../../../components/admin/AppointmentStatusControls'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { bookingSourceLabel } from '../../../lib/admin-booking-copy'
import { appointmentStatusLabel } from '../../../lib/admin-status'
import { getAdminAppointments } from '../../../server/services/admin-booking.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getStatusBadge(status: AppointmentStatus, lang: 'zh' | 'en') {
  const styles: Record<AppointmentStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    NO_SHOW: 'bg-stone-100 text-stone-700 border-stone-200',
  }
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {appointmentStatusLabel(status, lang)}
    </span>
  )
}

const allowedStatuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const
type StatusFilter = (typeof allowedStatuses)[number]

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; q?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const resolvedSearchParams = (await searchParams) ?? {}
  const rawStatus = String(resolvedSearchParams.status || 'ALL').toUpperCase()
  const selectedStatus = (allowedStatuses.includes(rawStatus as StatusFilter) ? rawStatus : 'ALL') as StatusFilter
  const searchQuery = String(resolvedSearchParams.q || '').trim().toLowerCase()

  const [lang, result] = await Promise.all([
    getAdminLang(),
    getAdminAppointments({ status: selectedStatus === 'ALL' ? undefined : selectedStatus as AppointmentStatus, pageSize: 100 }),
  ])

  // 全量统计用（不受搜索词影响）
  const allResult = await getAdminAppointments({ pageSize: 200 })
  const allItems = allResult.items

  // 搜索过滤（客户名 / 电话）
  const appointments = searchQuery
    ? result.items.filter((item) =>
        item.customerName.toLowerCase().includes(searchQuery) ||
        item.customerPhone.toLowerCase().includes(searchQuery)
      )
    : result.items

  const statusSummary = [
    { key: 'PENDING', labelZh: '待确认', labelEn: 'Pending' },
    { key: 'CONFIRMED', labelZh: '已确认', labelEn: 'Confirmed' },
    { key: 'COMPLETED', labelZh: '已完成', labelEn: 'Completed' },
    { key: 'CANCELLED', labelZh: '已取消', labelEn: 'Cancelled' },
  ] as const

  // 构建搜索 URL（保留 status 参数）
  function searchUrl(q: string) {
    const params = new URLSearchParams()
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus)
    if (q) params.set('q', q)
    const qs = params.toString()
    return `/admin/appointments${qs ? `?${qs}` : ''}`
  }

  function statusUrl(status: string) {
    const params = new URLSearchParams()
    if (status !== 'ALL') params.set('status', status)
    if (searchQuery) params.set('q', searchQuery)
    const qs = params.toString()
    return `/admin/appointments${qs ? `?${qs}` : ''}`
  }

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '预约管理', 'Bookings')}
      subtitle={pick(lang, '查看预约、筛选状态、搜索客户、修改状态、写备注，或进入详情页处理完整预约信息。', 'Filter by status, search customers, update states, leave internal notes and open full booking details.')}
      pendingCount={allItems.filter((e) => e.status === 'PENDING').length}
    >
      {/* 工具栏 */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
            {pick(lang, '返回后台首页', 'Back to dashboard')}
          </Link>
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `当前结果 ${appointments.length} 条`, `Results: ${appointments.length}`)}
          </span>
          <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `全部 ${allResult.total} 条`, `Total: ${allResult.total}`)}
          </span>
        </div>

        {/* 搜索框 */}
        <form method="GET" action="/admin/appointments" className="flex items-center gap-2">
          {selectedStatus !== 'ALL' && <input type="hidden" name="status" value={selectedStatus} />}
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder={pick(lang, '搜索客户姓名或电话…', 'Search by name or phone…')}
            className="w-64 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-amber-500"
          />
          <button type="submit" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
            {pick(lang, '搜索', 'Search')}
          </button>
          {searchQuery && (
            <Link href={statusUrl('')} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
              {pick(lang, '清除', 'Clear')}
            </Link>
          )}
        </form>

        {/* 状态筛选 */}
        <div className="flex flex-wrap items-center gap-3">
          {allowedStatuses.map((status) => (
            <Link
              key={status}
              href={statusUrl(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedStatus === status ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
            >
              {appointmentStatusLabel(status, lang)}
            </Link>
          ))}
        </div>
      </div>

      {/* 统计卡片 + 快捷操作 */}
      <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          {statusSummary.map((item) => (
            <Link key={item.key} href={statusUrl(item.key)} className="rounded-3xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition hover:border-stone-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, item.labelZh, item.labelEn)}</p>
              <p className="mt-3 text-3xl font-semibold text-stone-900">{allItems.filter((e) => e.status === item.key).length}</p>
            </Link>
          ))}
        </div>

        <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, '快捷处理', 'Quick actions')}</p>
            <h2 className="mt-2 text-lg font-semibold text-stone-900">{pick(lang, '预约处理入口', 'Booking quick actions')}</h2>
          </div>
          <div className="space-y-3 text-sm">
            <Link href="/admin/appointments?status=PENDING" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
              <span>{pick(lang, '处理待确认预约', 'Handle pending bookings')}</span>
              <span className="font-semibold text-stone-900">{allItems.filter((e) => e.status === 'PENDING').length}</span>
            </Link>
            <Link href="/admin/appointments?status=CONFIRMED" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
              <span>{pick(lang, '查看已确认预约', 'Review confirmed bookings')}</span>
              <span className="font-semibold text-stone-900">{allItems.filter((e) => e.status === 'CONFIRMED').length}</span>
            </Link>
            <Link href="/admin/appointments?status=COMPLETED" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
              <span>{pick(lang, '查看已完成预约', 'Review completed bookings')}</span>
              <span className="font-semibold text-stone-900">{allItems.filter((e) => e.status === 'COMPLETED').length}</span>
            </Link>
          </div>
          <div className="border-t border-stone-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, '防滥用视角', 'Abuse protection view')}</p>
            <div className="mt-3 space-y-3 text-sm">
              <Link href="/admin/settings" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                <span>{pick(lang, '检查验证码与预约防护', 'Review captcha and booking protection')}</span>
                <span className="text-stone-500">→</span>
              </Link>
              <Link href="/admin/appointments?status=NO_SHOW" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                <span>{pick(lang, '查看爽约记录', 'Review no-show bookings')}</span>
                <span className="font-semibold text-stone-900">{allItems.filter((e) => e.status === 'NO_SHOW').length}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 列表 */}
      <AdminListFrame
        title={pick(lang, '预约列表', 'Booking list')}
        description={pick(lang, '可按状态筛选或搜索客户姓名/电话，直接修改状态、内部备注，或进入详情页查看完整信息。', 'Filter by status or search by customer name/phone. Update status and notes inline, or open the detail page.')}
      >
        {appointments.length === 0 ? (
          <div className="px-6 py-12 text-sm text-stone-500">
            {pick(lang,
              searchQuery ? `没有找到包含"${searchQuery}"的预约记录。` : selectedStatus === 'ALL' ? '当前还没有预约数据，或运行环境尚未连接数据库。' : '当前筛选下没有符合条件的预约数据。',
              searchQuery ? `No bookings found for "${searchQuery}".` : selectedStatus === 'ALL' ? 'No bookings yet, or the database is not connected.' : 'No bookings match the current filter.'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {[pick(lang, '客户', 'Customer'), pick(lang, '服务', 'Service'), pick(lang, '预约时间', 'Booking time'), pick(lang, '当前状态 / 操作', 'Status / actions'), pick(lang, '来源', 'Source'), pick(lang, '联系方式', 'Contact'), pick(lang, '详情', 'Details'), pick(lang, '提交时间', 'Created at')].map((label) => (
                    <th key={label} className="px-6 py-4 text-left font-semibold text-stone-700">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {appointments.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900">{item.customerName}</div>
                      {item.notes ? <div className="mt-2 max-w-xs text-xs leading-6 text-stone-500">{pick(lang, '客户备注：', 'Note: ')}{item.notes}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-stone-700">{item.serviceName}</td>
                    <td className="px-6 py-4 text-stone-700">
                      <div>{item.appointmentDateLabel}</div>
                      <div className="mt-1 text-xs text-stone-500">{item.appointmentTimeLabel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        <div>{getStatusBadge(item.status, lang)}</div>
                        <AppointmentStatusControls id={item.id} currentStatus={item.status} internalNote={item.internalNote} lang={lang} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-700">{bookingSourceLabel(item.source, lang)}</td>
                    <td className="px-6 py-4 text-stone-700">
                      <div>{item.customerPhone}</div>
                      {item.customerEmail ? <div className="mt-1 text-xs text-stone-500">{item.customerEmail}</div> : null}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/appointments/${item.id}`} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500">
                        {pick(lang, '查看详情', 'View details')}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{item.createdAtLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminListFrame>
    </AdminShell>
  )
}
