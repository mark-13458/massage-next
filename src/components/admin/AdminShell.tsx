import { AdminLanguageSwitcher } from './AdminLanguageSwitcher'
import { AdminLogoutButton } from './AdminLogoutButton'
import { AdminNav } from './AdminNav'
import { AdminLang, pick } from '../../lib/admin-i18n'

export function AdminShell({
  children,
  title,
  subtitle,
  lang = 'zh',
  pendingCount,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
  lang?: AdminLang
  pendingCount?: number
}) {
  return (
    <div className="min-h-screen bg-[#f4efe7] text-stone-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="relative overflow-hidden border-r border-stone-200 bg-[#1f1a17] text-stone-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_32%)]" />
          <div className="relative flex h-full flex-col px-6 py-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-300/90">{pick(lang, '养生后台', 'Wellness Admin')}</p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">China TCM Massage</h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-stone-300">
                {pick(lang, '预约、服务、内容与图片管理的统一工作区。', 'A unified workspace for bookings, services, content and media.')}
              </p>
            </div>

            <AdminNav lang={lang} pendingCount={pendingCount} />

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, '当前会话', 'Session')}</p>
              <p className="mt-3 text-sm leading-6 text-stone-200">
                {pick(lang, '受保护的管理员会话，8 小时滑动窗口。', 'Protected admin session with 8-hour sliding window.')}
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-stone-200/80 bg-[#f8f3eb]/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-700">{pick(lang, '后台工作台', 'Admin Workspace')}</p>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-3">
                <AdminLanguageSwitcher currentLang={lang} />
                <AdminLogoutButton lang={lang} />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
