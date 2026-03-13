import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { ServiceForm } from '../../../../components/admin/ServiceForm'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewServicePage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '新建服务', 'New service')}
      subtitle={pick(lang, '现在服务管理已经进入表单阶段：可以直接创建双语服务条目。', 'Service management now has a full form workflow, so you can create bilingual service entries directly.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/services" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回服务列表', 'Back to services')}
        </Link>
      </AdminPageToolbar>
      <ServiceForm mode="create" lang={lang} />
    </AdminShell>
  )
}
