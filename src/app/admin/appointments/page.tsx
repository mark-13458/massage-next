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
  searchParams?: Promise<{ status?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const resolvedSearchParams = (await searchParams) ?? {}
  const rawStatus = String(resolvedSearchParams.status || 'ALL').toUpperCase()
  const selectedStatus = (allowedStatuses.includes(rawStatus as StatusFilter) ? rawStatus : 'ALL') as StatusFilter
  const appointments = await getAdminAppointments(selectedStatus)

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '预约管理', 'Bookings')}
      subtitle={pick(lang, '现在这页已经进入可操作阶段：支持状态筛选、状态修改、内部备注，并可进入详情页查看完整预约信息。', 'This page is now operational: filter by status, update states, leave internal notes and open full booking details.')}
    >
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
            {pick(lang, '返回后台首页', 'Back to dashboard')}
          </Link>
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `当前筛选结果 ${appointments.length} 条`, `Filtered result: ${appointments.length}`)}
          </span>
          <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `当前列表最多展示 50 条`, 'Showing up to 50 records')}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        {allowedStatuses.map((status) => (
          <Link
            key={status}
            href={status === 'ALL' ? '/admin/appointments' : `/admin/appointments?status=${status}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedStatus === status ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
          >
            {appointmentStatusLabel(status, lang)}
          </Link>
        ))}
        </div>
      </div>

      <AdminListFrame
        title={pick(lang, '预约列表', 'Booking list')}
        description={pick(lang, '当前展示最近 50 条记录，可按状态筛选，并可直接修改状态、内部备注或进入详情页查看完整信息。现在也能更直观看到当前筛选结果数量。', 'Showing the latest 50 records. Filter by status, update status and internal notes, or open the detail page for full context.')}
      >

        {appointments.length === 0 ? (
          <div className="px-6 py-12 text-sm text-stone-500">{pick(lang, selectedStatus === 'ALL' ? '当前还没有预约数据，或运行环境尚未连接数据库。' : '当前筛选下没有符合条件的预约数据。你可以切换状态筛选，或等待新的预约进入。', selectedStatus === 'ALL' ? 'No bookings yet, or the current environment is not connected to the database.' : 'No bookings match the current filter. Try another status filter or wait for new bookings to arrive.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {[pick(lang, '客户', 'Customer'), pick(lang, '服务', 'Service'), pick(lang, '预约时间', 'Booking time'), pick(lang, '当前状态 / 操作', 'Status / actions'), pick(lang, '来源', 'Source'), pick(lang, '联系方式', 'Contact'), pick(lang, '详情', 'Details'), pick(lang, '提交时间', 'Created at')].map((label) => (
                    <th key={label} className="px-6 py-4 text-left font-semibold text-stone-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {appointments.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900">{item.customerName}</div>
                      {item.notes ? <div className="mt-2 max-w-xs text-xs leading-6 text-stone-500">{pick(lang, '客户备注：', 'Customer note: ')}{item.notes}</div> : null}
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
