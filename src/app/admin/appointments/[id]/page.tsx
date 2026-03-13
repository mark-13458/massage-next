import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { AppointmentStatusControls } from '../../../../components/admin/AppointmentStatusControls'
import { AppointmentQuickActions } from '../../../../components/admin/AppointmentQuickActions'

function getStatusBadge(status: AppointmentStatus) {
  const styles: Record<AppointmentStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    NO_SHOW: 'bg-stone-100 text-stone-700 border-stone-200',
  }

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  )
}

async function getAppointment(id: number) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, confirmedBy: true },
    })
  } catch {
    return null
  }
}

export default async function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const appointment = await getAppointment(id)
  if (!appointment) notFound()

  return (
    <AdminShell title="预约详情" subtitle="这页用于查看完整预约信息，并在更聚焦的上下文里进行状态流转与内部处理。">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/appointments" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回预约列表
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900">客户与预约信息</h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {getStatusBadge(appointment.status)}
            <span className="text-xs text-stone-500">当前预约状态</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm text-stone-700">
            <div><span className="font-semibold text-stone-900">客户姓名：</span>{appointment.customerName}</div>
            <div><span className="font-semibold text-stone-900">联系电话：</span>{appointment.customerPhone}</div>
            <div><span className="font-semibold text-stone-900">邮箱：</span>{appointment.customerEmail || '—'}</div>
            <div><span className="font-semibold text-stone-900">语言：</span>{appointment.locale}</div>
            <div><span className="font-semibold text-stone-900">服务项目：</span>{appointment.service.nameDe}</div>
            <div><span className="font-semibold text-stone-900">来源：</span>{appointment.source}</div>
            <div><span className="font-semibold text-stone-900">预约日期：</span>{new Intl.DateTimeFormat('de-DE').format(appointment.appointmentDate)}</div>
            <div><span className="font-semibold text-stone-900">预约时间：</span>{appointment.appointmentTime}</div>
            <div><span className="font-semibold text-stone-900">时长：</span>{appointment.durationMin} min</div>
            <div><span className="font-semibold text-stone-900">价格快照：</span>€ {appointment.priceSnapshot.toString()}</div>
          </div>

          <div className="mt-6 rounded-2xl border border-stone-100 p-4 text-sm text-stone-700">
            <p className="font-semibold text-stone-900">客户备注</p>
            <p className="mt-2 leading-7">{appointment.notes || '—'}</p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">快捷操作</h2>
            <div className="mt-5">
              <AppointmentQuickActions id={appointment.id} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-stone-900">状态处理</h2>
              {getStatusBadge(appointment.status)}
            </div>
            <div className="mt-5">
              <AppointmentStatusControls id={appointment.id} currentStatus={appointment.status} internalNote={appointment.internalNote} />
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm text-sm text-stone-700">
            <h2 className="text-lg font-semibold text-stone-900">内部记录</h2>
            <div className="mt-4 space-y-3 leading-7">
              <p><span className="font-semibold text-stone-900">内部备注：</span>{appointment.internalNote || '—'}</p>
              <p><span className="font-semibold text-stone-900">提交时间：</span>{new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.createdAt)}</p>
              <p><span className="font-semibold text-stone-900">确认时间：</span>{appointment.confirmedAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.confirmedAt) : '—'}</p>
              <p><span className="font-semibold text-stone-900">完成时间：</span>{appointment.completedAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.completedAt) : '—'}</p>
              <p><span className="font-semibold text-stone-900">取消时间：</span>{appointment.cancelledAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.cancelledAt) : '—'}</p>
              <p><span className="font-semibold text-stone-900">处理人：</span>{appointment.confirmedBy?.name || '—'}</p>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
