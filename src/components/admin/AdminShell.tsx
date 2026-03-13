import Link from 'next/link'
import { AdminLanguageSwitcher } from './AdminLanguageSwitcher'
import { AdminLang, pick } from '../../lib/admin-i18n'

const navItems = [
  { href: '/admin', labelZh: '概览', labelEn: 'Overview', descZh: '仪表盘', descEn: 'Dashboard', icon: '◈' },
  { href: '/admin/appointments', labelZh: '预约管理', labelEn: 'Bookings', descZh: '预约', descEn: 'Bookings', icon: '◌' },
  { href: '/admin/services', labelZh: '服务项目', labelEn: 'Services', descZh: '服务', descEn: 'Services', icon: '◇' },
  { href: '/admin/content', labelZh: '网站内容', labelEn: 'Content', descZh: '内容', descEn: 'Content', icon: '◎' },
  { href: '/admin/gallery', labelZh: '图库管理', labelEn: 'Gallery', descZh: '图片', descEn: 'Media', icon: '▣' },
  { href: '/admin/settings', labelZh: '系统设置', labelEn: 'Settings', descZh: '系统', descEn: 'Settings', icon: '✦' },
]

export function AdminShell({ children, title, subtitle, lang = 'zh' }: { children: React.ReactNode; title: string; subtitle?: string; lang?: AdminLang }) {
  return (
    <div className="min-h-screen bg-[#f4efe7] text-stone-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="relative overflow-hidden border-r border-stone-200 bg-[#1f1a17] text-stone-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_32%)]" />
          <div className="relative flex h-full flex-col px-6 py-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-300/90">Wellness Admin</p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">China TCM Massage</h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-stone-300">
                {pick(lang, '一个更适合日常运营的后台工作区：把预约、服务、内容与图片管理收拢到统一视图里。', 'A calmer operations workspace for daily management across bookings, services, content and media.')}
              </p>
            </div>

            <nav className="mt-10 grid gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group rounded-2xl border border-white/8 bg-white/5 px-4 py-4 transition hover:border-amber-300/30 hover:bg-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-sm text-amber-200 ring-1 ring-amber-300/20">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{pick(lang, item.labelZh, item.labelEn)}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-stone-400">{pick(lang, item.descZh, item.descEn)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, '当前重点', 'Current Focus')}</p>
              <p className="mt-3 text-sm leading-6 text-stone-200">
                {pick(lang, '先把后台做成稳定、专业、易接手的运营台，再继续补更高级的安全策略与模板化体验。', 'Stabilize the admin into a professional, handoff-friendly workspace first, then layer in stronger security and richer templates.')}
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-stone-200 bg-[#f8f3eb]/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Admin Workspace</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
                {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-3">
                <AdminLanguageSwitcher currentLang={lang} />
                <div className="hidden rounded-2xl border border-stone-200 bg-white px-4 py-3 text-right shadow-sm sm:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{pick(lang, '状态', 'Status')}</p>
                  <p className="mt-1 text-sm font-medium text-stone-700">{pick(lang, '受保护的后台会话', 'Protected admin session')}</p>
                </div>
                <form action="/api/admin/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-500 hover:bg-stone-50"
                  >
                    {pick(lang, '退出登录', 'Sign out')}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  )
}
