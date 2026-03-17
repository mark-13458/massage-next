import { redirect } from 'next/navigation'
import { AdminLoginForm } from '../../../components/admin/AdminLoginForm'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { env } from '../../../lib/env'

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin()
  if (admin) redirect('/admin')

  const lang = await getAdminLang()
  const turnstileSiteKey = env.adminTurnstile.siteKey || null

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1f1a17]">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.10),transparent_36%)]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-300/90">
            {pick(lang, '养生后台', 'Wellness Admin')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            China TCM Massage
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            {pick(lang, '管理员专属入口', 'Administrator access only')}
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">
              {pick(lang, '安全登录', 'Secure sign in')}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {pick(lang, '后台登录', 'Admin sign in')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              {pick(lang, '请使用管理员账号登录，会话有效期 8 小时。', 'Sign in with your administrator account. Session lasts 8 hours.')}
            </p>

            <div className="mt-6">
              <AdminLoginForm lang={lang} turnstileSiteKey={turnstileSiteKey} />
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-stone-500">
            {pick(lang, '受保护的管理员入口 · 禁止未授权访问', 'Protected admin entry · Unauthorized access prohibited')}
          </p>
        </div>
      </div>
    </main>
  )
}
