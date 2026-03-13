import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import { AdminShell } from '../../../components/admin/AdminShell'
import { ServiceControls } from '../../../components/admin/ServiceControls'
import { getCurrentAdmin } from '../../../lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getServices() {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    return await prisma.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      take: 100,
    })
  } catch {
    return []
  }
}

export default async function AdminServicesPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const services = await getServices()

  return (
    <AdminShell title="服务项目" subtitle="服务管理已进入完整维护阶段：不仅能开关和排序，还能新建与编辑双语服务内容。">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回 Dashboard
        </Link>
        <Link href="/admin/services/new" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
          新建服务
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="border-b border-stone-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-stone-900">服务列表</h2>
          <p className="mt-2 text-sm text-stone-600">当前支持完整内容维护、上架/下架、精选开关和排序调整。</p>
        </div>

        {services.length === 0 ? (
          <div className="px-6 py-12 text-sm text-stone-500">当前没有可显示的服务数据，或运行环境尚未连接数据库。</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-100 text-sm">
              <thead className="bg-stone-50">
                <tr>
                  {['服务', '英文名', '时长 / 价格', '状态与排序', '编辑', 'Slug'].map((label) => (
                    <th key={label} className="px-6 py-4 text-left font-semibold text-stone-700">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {services.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-stone-900">{item.nameDe}</div>
                      {item.summaryDe ? <div className="mt-2 max-w-md text-xs leading-6 text-stone-500">{item.summaryDe}</div> : null}
                    </td>
                    <td className="px-6 py-4 text-stone-700">{item.nameEn}</td>
                    <td className="px-6 py-4 text-stone-700">
                      <div>{item.durationMin} min</div>
                      <div className="mt-1 text-xs text-stone-500">€ {item.price.toString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <ServiceControls
                        id={item.id}
                        initialActive={item.isActive}
                        initialFeatured={item.isFeatured}
                        initialSortOrder={item.sortOrder}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/services/${item.id}`} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500">
                        编辑
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">{item.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
