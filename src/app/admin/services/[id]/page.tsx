import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '../../../../lib/prisma'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { ServiceForm } from '../../../../components/admin/ServiceForm'
import { DeleteServiceButton } from '../../../../components/admin/DeleteServiceButton'

async function getService(id: number) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await prisma.service.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) notFound()

  const service = await getService(id)
  if (!service) notFound()

  return (
    <AdminShell title="编辑服务" subtitle="这一步已经不只是开关控制，而是可以直接维护服务的完整字段，并支持删除无关联预约的服务。">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/services" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回服务列表
        </Link>
        <DeleteServiceButton id={service.id} />
      </div>
      <ServiceForm
        mode="edit"
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
