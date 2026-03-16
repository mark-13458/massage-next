import { redirect } from 'next/navigation'
import { AdminLoginForm } from '../../../components/admin/AdminLoginForm'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin()
  if (admin) {
    redirect('/admin')
  }

  const lang = await getAdminLang()

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Admin Access</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">{pick(lang, '后台登录', 'Admin sign in')}</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">{pick(lang, '请使用管理员账号登录。', 'Sign in with your administrator account.')}</p>
        </div>
        <AdminLoginForm lang={lang} />
      </div>
    </main>
  )
}
