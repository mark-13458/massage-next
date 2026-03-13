import Link from 'next/link'
import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../../lib/prisma'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AppointmentStatusControls } from '../../../components/admin/AppointmentStatusControls'

const allowedStatuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const

type StatusFilter = (typeof allowedStatuses)[number]

async function getAppointments(status: StatusFilter) {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    return await prisma.appointment.findMany({
      where: status === 'ALL' ? undefined : { status: status as AppointmentStatus },
      include: { service: true },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    })
  } catch {
    return []
  }
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const rawStatus = String(resolvedSearchParams.status || 'ALL').toUpperCase()
  const selectedStatus = (allowedStatuses.includes(rawStatus as StatusFilter) ? rawStatus : 'ALL') as StatusFilter
  const appointments = await getAppointments(selectedStatus)

  return (
    <AdminShell title="预约管理" subtitle="现在这页已经进入可操作阶段：支持状态筛选、状态修改、内部备注，并可进入详情页查看完整预约信息。">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回 Dashboard
        </Link>
        {allowedStatuses.map((status) => (
          <Link
            key={status}
            href={status === 'ALL' ? '/admin/appointments' : `/admin/appointments?status=${status}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedStatus === status ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
          >
            {status}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="border-b border-stone-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-stone-900">预约列表</h2>
          <p className="mt-2 text-sm text-stone-600">当前展示最近 50 条记录，可按状态筛选，并可直接修改状态、内部备注或进入详情页查看完整信息。</p>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-12 text-sm text-stone-500">当前没有符合条件的预约数据，或运行环境尚未连接数据库。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {['客户', '服务', '预约时间', '状态操作', '来源', '联系方式', '详情', '提交时间'].map((label) => (
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
                      {item.notes ? <div className="mt-2 max-w-xs text-xs leading-6 text-stone-500">客户备注：{item.notes}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-stone-700">{item.service.nameDe}</td>
                    <td className="px-6 py-4 text-stone-700">
                      <div>{new Intl.DateTimeFormat('de-DE').format(item.appointmentDate)}</div>
                      <div className="mt-1 text-xs text-stone-500">{item.appointmentTime} · {item.durationMin} min</div>
                    </td>
                    <td className="px-6 py-4">
                      <AppointmentStatusControls id={item.id} currentStatus={item.status} internalNote={item.internalNote} />
                    </td>
                    <td className="px-6 py-4 text-stone-700">{item.source}</td>
                    <td className="px-6 py-4 text-stone-700">
                      <div>{item.customerPhone}</div>
                      {item.customerEmail ? <div className="mt-1 text-xs text-stone-500">{item.customerEmail}</div> : null}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/appointments/${item.id}`} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500">
                        查看详情
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
