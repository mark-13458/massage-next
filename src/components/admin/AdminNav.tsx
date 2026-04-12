'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type AdminLang = 'zh' | 'en'
function pick(lang: AdminLang, zh: string, en: string) { return lang === 'en' ? en : zh }

const navItems = [
  { href: '/admin', labelZh: '概览', labelEn: 'Overview', descZh: '工作台', descEn: 'Dashboard', icon: '◈', exact: true },
  { href: '/admin/appointments', labelZh: '预约管理', labelEn: 'Bookings', descZh: '预约', descEn: 'Bookings', icon: '◌', exact: false },
  { href: '/admin/services', labelZh: '服务项目', labelEn: 'Services', descZh: '服务', descEn: 'Services', icon: '◇', exact: false },
  { href: '/admin/articles', labelZh: '文章管理', labelEn: 'Articles', descZh: '博客文章', descEn: 'Blog', icon: '▤', exact: false },
  { href: '/admin/content', labelZh: '网站内容', labelEn: 'Content', descZh: '文案与资料', descEn: 'Content', icon: '◎', exact: false },
  { href: '/admin/gallery', labelZh: '图库管理', labelEn: 'Gallery', descZh: '图片资料', descEn: 'Media', icon: '▣', exact: false },
  { href: '/admin/testimonials', labelZh: '客户评价', labelEn: 'Testimonials', descZh: '评价', descEn: 'Reviews', icon: '◉', exact: false },
  { href: '/admin/settings', labelZh: '系统设置', labelEn: 'Settings', descZh: '配置', descEn: 'Settings', icon: '✦', exact: false },
]

export function AdminNav({ lang, pendingCount }: { lang: AdminLang; pendingCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="mt-10 grid gap-3">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group rounded-2xl border px-4 py-4 transition ${
              isActive
                ? 'border-amber-300/40 bg-amber-400/10'
                : 'border-white/8 bg-white/5 hover:border-amber-300/30 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl text-sm ring-1 ${
                isActive ? 'bg-amber-400/20 text-amber-200 ring-amber-300/40' : 'bg-amber-400/10 text-amber-200 ring-amber-300/20'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${isActive ? 'text-amber-200' : 'text-white'}`}>
                    {pick(lang, item.labelZh, item.labelEn)}
                  </span>
                  {item.href === '/admin/appointments' && pendingCount && pendingCount > 0 ? (
                    <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-stone-900">{pendingCount}</span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.24em] text-stone-400">{pick(lang, item.descZh, item.descEn)}</div>
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
