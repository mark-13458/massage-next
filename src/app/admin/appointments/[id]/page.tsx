import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AppointmentStatus } from '@prisma/client'
import { AdminDetailBlock } from '../../../../components/admin/AdminDetailBlock'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { AppointmentStatusControls } from '../../../../components/admin/AppointmentStatusControls'
import { AppointmentQuickActions } from '../../../../components/admin/AppointmentQuickActions'
import { AdminWorkspaceLayout } from '../../../../components/admin/AdminWorkspaceLayout'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { appointmentStatusLabel } from '../../../../lib/admin-status'
import { getAdminAppointmentDetail } from '../../../../server/services/admin-booking.service'

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

export default async function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const appointment = await getAdminAppointmentDetail(id)
  if (!appointment) notFound()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '预约详情', 'Booking details')}
      subtitle={pick(lang, '这页用于查看完整预约信息，并在更聚焦的上下文里进行状态流转与内部处理。', 'Use this page to inspect full booking details and handle status updates in a more focused context.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/appointments" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回预约列表', 'Back to booking list')}
        </Link>
      </AdminPageToolbar>

      <AdminWorkspaceLayout
        ratio="content-heavy"
        main={
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-stone-900">{pick(lang, '客户与预约信息', 'Customer and booking information')}</h2>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {getStatusBadge(appointment.status, lang)}
              <span className="text-xs text-stone-500">{pick(lang, '当前预约状态', 'Current booking status')}</span>
            </div>

            <div className="mt-6 grid gap-4 text-sm text-stone-700 md:grid-cols-2">
              <div><span className="font-semibold text-stone-900">{pick(lang, '客户姓名：', 'Customer name: ')}</span>{appointment.customerName}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '联系电话：', 'Phone: ')}</span>{appointment.customerPhone}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '邮箱：', 'Email: ')}</span>{appointment.customerEmail || '—'}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '语言：', 'Locale: ')}</span>{appointment.locale}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '服务项目：', 'Service: ')}</span>{appointment.service.nameDe}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '来源：', 'Source: ')}</span>{appointment.source}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '预约日期：', 'Date: ')}</span>{new Intl.DateTimeFormat('de-DE').format(appointment.appointmentDate)}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '预约时间：', 'Time: ')}</span>{appointment.appointmentTime}</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '时长：', 'Duration: ')}</span>{appointment.durationMin} min</div>
              <div><span className="font-semibold text-stone-900">{pick(lang, '价格快照：', 'Price snapshot: ')}</span>€ {appointment.priceSnapshot.toString()}</div>
            </div>

            <div className="mt-6 rounded-2xl border border-stone-100 p-4 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">{pick(lang, '客户备注', 'Customer note')}</p>
              <p className="mt-2 leading-7">{appointment.notes || '—'}</p>
            </div>
          </section>
        }
        aside={
          <>
            <AdminDetailBlock title={pick(lang, '快捷操作', 'Quick actions')}>
              <AppointmentQuickActions id={appointment.id} lang={lang} />
            </AdminDetailBlock>

            <AdminDetailBlock title={pick(lang, '状态处理', 'Status handling')}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {getStatusBadge(appointment.status, lang)}
              </div>
              <div className="mt-5">
                <AppointmentStatusControls id={appointment.id} currentStatus={appointment.status} internalNote={appointment.internalNote} lang={lang} />
              </div>
            </AdminDetailBlock>

            <AdminDetailBlock title={pick(lang, '内部记录', 'Internal record')}>
              <div className="space-y-3 text-sm leading-7 text-stone-700">
                <p><span className="font-semibold text-stone-900">{pick(lang, '内部备注：', 'Internal note: ')}</span>{appointment.internalNote || '—'}</p>
                <p><span className="font-semibold text-stone-900">{pick(lang, '提交时间：', 'Created at: ')}</span>{new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.createdAt)}</p>
                <p><span className="font-semibold text-stone-900">{pick(lang, '确认时间：', 'Confirmed at: ')}</span>{appointment.confirmedAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.confirmedAt) : '—'}</p>
                <p><span className="font-semibold text-stone-900">{pick(lang, '完成时间：', 'Completed at: ')}</span>{appointment.completedAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.completedAt) : '—'}</p>
                <p><span className="font-semibold text-stone-900">{pick(lang, '取消时间：', 'Cancelled at: ')}</span>{appointment.cancelledAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.cancelledAt) : '—'}</p>
                <p><span className="font-semibold text-stone-900">{pick(lang, '处理人：', 'Handled by: ')}</span>{appointment.confirmedBy?.name || '—'}</p>
              </div>
            </AdminDetailBlock>
          </>
        }
      />
    </AdminShell>
  )
}
