import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { AdminSectionCard } from '../../../../components/admin/AdminSectionCard'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { getAuditLogs } from '../../../../server/services/audit.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams?: Promise<{ action?: string; type?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const resolvedParams = (await searchParams) ?? {}

  // 获取审计日志
  const logs = await getAuditLogs({
    action: resolvedParams.action,
    entityType: resolvedParams.type,
    limit: 100,
  })

  const actionFilters = [
    { key: 'BOOKING_CREATED', label: pick(lang, '预约创建', 'Booking created') },
    { key: 'BOOKING_CONFIRMED', label: pick(lang, '预约确认', 'Booking confirmed') },
    { key: 'BOOKING_CANCELLED', label: pick(lang, '预约取消', 'Booking cancelled') },
    { key: 'BOOKING_MANAGE', label: pick(lang, '预约管理', 'Booking managed') },
  ]

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '操作日志', 'Audit logs')}
      subtitle={pick(
        lang,
        '系统操作日志：跟踪所有关键业务事件、管理员操作与安全相关记录。',
        'System audit logs: track all critical business events, admin operations and security records.'
      )}
    >
      <AdminPageToolbar>
        <Link
          href="/admin/settings"
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
        >
          {pick(lang, '返回系统设置', 'Back to settings')}
        </Link>
      </AdminPageToolbar>

      <AdminSectionCard
        eyebrow={pick(lang, '日志工作区', 'Logs workspace')}
        title={pick(lang, '操作日志查看', 'Audit log viewer')}
        description={pick(
          lang,
          '实时展示系统关键事件：预约操作、管理员操作、登录记录等。支持按操作类型筛选。',
          'Real-time view of critical system events: booking operations, admin actions, login records and more. Filter by action type.'
        )}
      >
        {/* 筛选条件 */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
              {pick(lang, `日志总数 ${logs.length} 条`, `Total logs: ${logs.length}`)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actionFilters.map((filter) => (
              <Link
                key={filter.key}
                href={`/admin/settings/audit-logs?action=${filter.key}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  resolvedParams.action === filter.key
                    ? 'bg-stone-900 text-white'
                    : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                }`}
              >
                {filter.label}
              </Link>
            ))}
            <Link
              href="/admin/settings/audit-logs"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !resolvedParams.action
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'
              }`}
            >
              {pick(lang, '全部', 'All')}
            </Link>
          </div>
        </div>

        {/* 日志列表 */}
        {logs.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-stone-50 px-6 py-12 text-center text-sm text-stone-500">
            {pick(lang, '暂无操作日志记录。', 'No audit logs found.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {[
                    pick(lang, '时间', 'Time'),
                    pick(lang, '操作', 'Action'),
                    pick(lang, '实体类型', 'Entity type'),
                    pick(lang, '操作人', 'Changed by'),
                    pick(lang, '详情', 'Details'),
                  ].map((label) => (
                    <th key={label} className="px-6 py-4 text-left font-semibold text-stone-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 text-stone-700">
                      <div>{log.createdAt.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'de-DE')}</div>
                      <div className="text-xs text-stone-500">{log.createdAt.toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'de-DE')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-700">{log.entityType}</td>
                    <td className="px-6 py-4 text-stone-700">
                      {log.changedByUser ? (
                        <>
                          <div className="font-medium">{log.changedByUser.name}</div>
                          <div className="text-xs text-stone-500">{log.changedByUser.email}</div>
                        </>
                      ) : (
                        <span className="text-stone-500">{pick(lang, '系统', 'System')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs leading-6 text-stone-600">
                        {log.ipAddress && <div>{pick(lang, '来源 IP:', 'IP: ')}{log.ipAddress}</div>}
                        {log.entityId && <div>{pick(lang, '实体 ID:', 'Entity ID: ')}{log.entityId}</div>}
                        {log.additionalInfo && (
                          <div className="mt-2 rounded bg-stone-50 p-2">
                            <pre className="text-xs font-mono text-stone-500">
                              {JSON.stringify(log.additionalInfo, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </AdminShell>
  )
}
