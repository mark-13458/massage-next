import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminListFrame } from '../../../components/admin/AdminListFrame'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { ServiceControls } from '../../../components/admin/ServiceControls'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminServices } from '../../../server/services/admin-service.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminServicesPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const services = await getAdminServices()
  const lang = await getAdminLang()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '服务项目', 'Services')}
      subtitle={pick(lang, '把服务清单做成可维护资产：双语文案、价格、时长、精选与上下架都在一个工作台里完成。', 'Turn the service library into a maintainable asset with bilingual copy, pricing, duration, featured status and publishing controls in one workspace.')}
    >
      <AdminPageToolbar>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回 Dashboard', 'Back to dashboard')}
        </Link>
        <Link href="/admin/services/new" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
          {pick(lang, '新建服务', 'New service')}
        </Link>
      </AdminPageToolbar>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminSectionCard
          eyebrow="Service Library"
          title={pick(lang, '服务列表', 'Service list')}
          description={pick(lang, '当前支持完整内容维护、上架/下架、精选开关和排序调整。先维持现有业务逻辑，只升级后台视觉结构与管理节奏。', 'Support full content maintenance, publishing controls, featured toggles and sorting in one stable service workspace.')}
          actions={undefined}
        >
          {services.length === 0 ? (
            <AdminEmptyState title="暂时还没有服务数据" description="可能是数据库还没接通，或者你还没有创建第一条服务。接通数据库后可以直接在这里新建并维护双语服务。" />
          ) : (
            <AdminListFrame
              title={pick(lang, '服务列表', 'Service list')}
              description={pick(lang, '当前支持完整内容维护、上架/下架、精选开关和排序调整。先维持现有业务逻辑，只升级后台视觉结构与管理节奏。', 'Support full content maintenance, publishing controls, featured toggles and sorting in one stable service workspace.')}
            >
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
                        <td className="px-6 py-5">
                          <div className="font-semibold text-stone-900">{item.nameDe}</div>
                          {item.summaryDe ? <div className="mt-2 max-w-md text-xs leading-6 text-stone-500">{item.summaryDe}</div> : null}
                        </td>
                        <td className="px-6 py-5 text-stone-700">{item.nameEn}</td>
                        <td className="px-6 py-5 text-stone-700">
                          <div>{item.durationLabel}</div>
                          <div className="mt-1 text-xs text-stone-500">{item.priceLabel}</div>
                        </td>
                        <td className="px-6 py-5">
                          <ServiceControls
                            id={item.id}
                            initialActive={item.isActive}
                            initialFeatured={item.isFeatured}
                            initialSortOrder={item.sortOrder}
                          />
                        </td>
                        <td className="px-6 py-5">
                          <Link href={`/admin/services/${item.id}`} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500">
                            编辑
                          </Link>
                        </td>
                        <td className="px-6 py-5 text-xs text-stone-500">{item.slug}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminListFrame>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          eyebrow="Management Notes"
          title={pick(lang, '服务管理建议', 'Service management notes')}
          description={pick(lang, '先把服务条目做干净，再继续补更细的封面、批量操作和内容模板化能力。', 'Keep the service catalog clean first, then layer richer media, batch actions and templated editing on top.')}
          tone="dark"
        >
          <div className="space-y-4 text-sm leading-7 text-stone-300">
            <p>每个服务至少保持：双语名称、双语摘要、时长、价格、排序和上下架状态完整。</p>
            <p>如果后续要继续升级后台模板，服务表格会是最适合加入 badge、过滤器和批量操作的页面之一。</p>
            <p>当前这页先保持“稳定可运营”，后面再继续上更复杂的模板化交互。</p>
          </div>
        </AdminSectionCard>
      </div>
    </AdminShell>
  )
}
