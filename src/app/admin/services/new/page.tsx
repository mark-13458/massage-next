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
      subtitle={pick(lang, '填写双语名称、摘要、描述、时长与价格，创建新的服务条目。', 'Fill in bilingual name, summary, description, duration and price to create a new service.')}
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
