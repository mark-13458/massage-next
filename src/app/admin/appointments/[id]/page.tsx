import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AppointmentStatus } from '@prisma/client'
import { AdminDetailBlock } from '../../../../components/admin/AdminDetailBlock'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { AppointmentStatusControls } from '../../../../components/admin/AppointmentStatusControls'
import { AppointmentQuickActions } from '../../../../components/admin/AppointmentQuickActions'
import { AdminInfoList } from '../../../../components/admin/AdminInfoList'
import { AdminWorkspaceLayout } from '../../../../components/admin/AdminWorkspaceLayout'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { bookingSourceLabel, localeLabel } from '../../../../lib/admin-booking-copy'
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

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const { id: rawId } = await params
  const id = Number(rawId)
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

            <div className="mt-6">
              <AdminInfoList
                items={[
                  { label: pick(lang, '客户姓名', 'Customer name'), value: appointment.customerName },
                  { label: pick(lang, '联系电话', 'Phone'), value: appointment.customerPhone },
                  { label: pick(lang, '邮箱', 'Email'), value: appointment.customerEmail || '—' },
                  { label: pick(lang, '语言', 'Locale'), value: localeLabel(appointment.locale, lang) },
                  { label: pick(lang, '服务项目', 'Service'), value: appointment.service.nameDe },
                  { label: pick(lang, '来源', 'Source'), value: bookingSourceLabel(appointment.source, lang) },
                  { label: pick(lang, '预约日期', 'Date'), value: new Intl.DateTimeFormat('de-DE').format(appointment.appointmentDate) },
                  { label: pick(lang, '预约时间', 'Time'), value: appointment.appointmentTime },
                  { label: pick(lang, '时长', 'Duration'), value: `${appointment.durationMin} min` },
                  { label: pick(lang, '价格快照', 'Price snapshot'), value: `€ ${appointment.priceSnapshot.toString()}` },
                ]}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-stone-100 p-4 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">{pick(lang, '客户备注', 'Customer note')}</p>
              <p className="mt-2 leading-7">{appointment.notes || '—'}</p>
            </div>
          </section>
        }
        aside={
          <>
            <AdminDetailBlock title={pick(lang, '快捷处理', 'Quick actions')}>
              <AppointmentQuickActions id={appointment.id} lang={lang} />
            </AdminDetailBlock>

            <AdminDetailBlock title={pick(lang, '状态操作', 'Status handling')}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {getStatusBadge(appointment.status, lang)}
              </div>
              <div className="mt-5">
                <AppointmentStatusControls id={appointment.id} currentStatus={appointment.status} internalNote={appointment.internalNote} lang={lang} />
              </div>
            </AdminDetailBlock>

            <AdminDetailBlock title={pick(lang, '客户安全链接', 'Customer security links')}>
              <AdminInfoList
                items={[
                  { label: pick(lang, '管理 token', 'Manage token'), value: appointment.confirmationToken || '—' },
                  { label: pick(lang, '安全链接 API', 'Secure link API'), value: appointment.confirmationToken ? `/api/booking/manage/${appointment.confirmationToken}` : '—' },
                  { label: pick(lang, '客户页面链接', 'Customer page link'), value: appointment.confirmationToken ? `/${appointment.locale || 'de'}/booking/manage/${appointment.confirmationToken}` : '—' },
                ]}
              />
            </AdminDetailBlock>

            <AdminDetailBlock title={pick(lang, '内部记录', 'Internal record')}>
              <AdminInfoList
                items={[
                  { label: pick(lang, '内部备注', 'Internal note'), value: appointment.internalNote || '—' },
                  { label: pick(lang, '提交时间', 'Created at'), value: new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.createdAt) },
                  { label: pick(lang, '确认时间', 'Confirmed at'), value: appointment.confirmedAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.confirmedAt) : '—' },
                  { label: pick(lang, '完成时间', 'Completed at'), value: appointment.completedAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.completedAt) : '—' },
                  { label: pick(lang, '取消时间', 'Cancelled at'), value: appointment.cancelledAt ? new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(appointment.cancelledAt) : '—' },
                  { label: pick(lang, '处理人', 'Handled by'), value: appointment.confirmedBy?.name || '—' },
                ]}
              />
            </AdminDetailBlock>
          </>
        }
      />
    </AdminShell>
  )
}
