import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { ServiceForm } from '../../../../components/admin/ServiceForm'
import { DeleteServiceButton } from '../../../../components/admin/DeleteServiceButton'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { getAdminServiceDetail } from '../../../../server/services/admin-service.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isFinite(id)) notFound()

  const service = await getAdminServiceDetail(id)
  if (!service) notFound()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '编辑服务', 'Edit service')}
      subtitle={pick(lang, '编辑服务的双语文案、价格、时长、排序与上下架状态。', 'Edit bilingual copy, pricing, duration, sorting and publishing status.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/services" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回服务列表', 'Back to services')}
        </Link>
        <DeleteServiceButton id={service.id} lang={lang} />
      </AdminPageToolbar>
      <ServiceForm
        mode="edit"
        lang={lang}
        service={{
          id: service.id,
          slug: service.slug,
          nameDe: service.nameDe,
          nameEn: service.nameEn,
          summaryDe: service.summaryDe,
          summaryEn: service.summaryEn,
          descriptionDe: service.descriptionDe,
          descriptionEn: service.descriptionEn,
          durationMin: service.durationMin,
          price: service.price.toString(),
          sortOrder: service.sortOrder,
          isFeatured: service.isFeatured,
          isActive: service.isActive,
        }}
      />
    </AdminShell>
  )
}
