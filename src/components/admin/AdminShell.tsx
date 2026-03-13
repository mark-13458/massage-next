import Link from 'next/link'

const navItems = [
  { href: '/admin', label: '概览' },
  { href: '/admin/appointments', label: '预约管理' },
  { href: '/admin/services', label: '服务项目' },
  { href: '/admin/content', label: '网站内容' },
]

export function AdminShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
              {subtitle ? <p className="mt-3 text-sm leading-6 text-stone-600">{subtitle}</p> : null}
            </div>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:bg-stone-50">
                退出登录
              </button>
            </form>
          </div>
        </div>

        <nav className="mb-8 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:bg-stone-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </div>
  )
}
