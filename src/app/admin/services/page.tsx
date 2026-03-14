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

const allowedFilters = ['all', 'active', 'inactive', 'featured'] as const

type ServiceFilter = (typeof allowedFilters)[number]

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const services = await getAdminServices()
  const lang = await getAdminLang()
  const resolvedSearchParams = (await searchParams) ?? {}
  const rawFilter = String(resolvedSearchParams.filter || 'all').toLowerCase()
  const selectedFilter = (allowedFilters.includes(rawFilter as ServiceFilter) ? rawFilter : 'all') as ServiceFilter

  const filters = [
    { key: 'all', labelZh: '全部', labelEn: 'All' },
    { key: 'active', labelZh: '已上架', labelEn: 'Published' },
    { key: 'inactive', labelZh: '未上架', labelEn: 'Unpublished' },
    { key: 'featured', labelZh: '推荐服务', labelEn: 'Featured' },
  ] as const

  const filteredServices = services.filter((item) => {
    if (selectedFilter === 'active') return item.isActive
    if (selectedFilter === 'inactive') return !item.isActive
    if (selectedFilter === 'featured') return item.isFeatured
    return true
  })

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '服务项目', 'Services')}
      subtitle={pick(lang, '把服务清单做成可维护资产：双语文案、价格、时长、精选与上下架都在一个工作区里完成。', 'Turn the service library into a maintainable asset with bilingual copy, pricing, duration, featured status and publishing controls in one workspace.')}
    >
      <AdminPageToolbar>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回后台首页', 'Back to dashboard')}
        </Link>
        <Link href="/admin/services/new" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
          {pick(lang, '新建服务', 'New service')}
        </Link>
      </AdminPageToolbar>

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `当前筛选结果 ${filteredServices.length} 项`, `Filtered result: ${filteredServices.length}`)}
          </span>
          <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `全部服务 ${services.length} 项`, `Total services: ${services.length}`)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
        {filters.map((filter) => {
          const href = filter.key === 'all' ? '/admin/services' : `/admin/services?filter=${filter.key}`
          const active = selectedFilter === filter.key

          return (
            <Link
              key={filter.key}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}
            >
              {pick(lang, filter.labelZh, filter.labelEn)}
            </Link>
          )
        })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminSectionCard
          eyebrow={pick(lang, '服务资料库', 'Service library')}
          title={pick(lang, '服务列表', 'Service list')}
          description={pick(lang, '当前支持完整内容维护、上架/下架、精选开关和排序调整。先维持现有业务逻辑，只升级后台视觉结构与管理体验。', 'Support full content maintenance, publishing controls, featured toggles and sorting in one stable service workspace.')}
          actions={undefined}
        >
          {filteredServices.length === 0 ? (
            <AdminEmptyState
              title={pick(lang, '当前筛选下没有服务数据', 'No services match the current filter')}
              description={pick(lang, '你可以切换筛选条件，或者新建第一条服务。接通数据库后也可以直接在这里维护双语服务。', 'Try a different filter or create the first service. Once the database is connected, you can manage bilingual services here directly.')}
            />
          ) : (
            <AdminListFrame
              title={pick(lang, '服务列表', 'Service list')}
              description={pick(lang, '当前支持完整内容维护、上架/下架、推荐服务切换和排序调整。现在也可以按状态快速筛选，减少来回翻找。', 'Support full content maintenance, publishing controls, featured toggles and sorting in one stable service workspace.')}
            >
              <div className="mb-4 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                  {pick(lang, `已上架 ${services.filter((item) => item.isActive).length} 项`, `Published: ${services.filter((item) => item.isActive).length}`)}
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
                  {pick(lang, `未上架 ${services.filter((item) => !item.isActive).length} 项`, `Unpublished: ${services.filter((item) => !item.isActive).length}`)}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                  {pick(lang, `推荐服务 ${services.filter((item) => item.isFeatured).length} 项`, `Featured: ${services.filter((item) => item.isFeatured).length}`)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-stone-100 text-sm">
                  <thead className="bg-stone-50">
                    <tr>
                      {[
                        pick(lang, '服务', 'Service'),
                        pick(lang, '英文名', 'English name'),
                        pick(lang, '时长 / 价格', 'Duration / price'),
                        pick(lang, '状态与排序', 'Status / sorting'),
                        pick(lang, '编辑', 'Edit'),
                        'Slug',
                      ].map((label) => (
                        <th key={label} className="px-6 py-4 text-left font-semibold text-stone-700">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {filteredServices.map((item) => (
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
                            {pick(lang, '编辑', 'Edit')}
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

        <div className="space-y-6">
          <AdminSectionCard
            eyebrow={pick(lang, '快捷处理', 'Quick actions')}
            title={pick(lang, '服务管理快捷入口', 'Service quick actions')}
            description={pick(lang, '把高频服务管理动作收成入口，减少在列表中反复切筛选。', 'Collect the most common service-management actions into direct shortcuts to reduce repeated filter switching.')}
          >
            <div className="space-y-3 text-sm">
              <Link href="/admin/services?filter=inactive" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                <span>{pick(lang, '查看未上架服务', 'Review unpublished services')}</span>
                <span className="font-semibold text-stone-900">{services.filter((item) => !item.isActive).length}</span>
              </Link>
              <Link href="/admin/services?filter=featured" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                <span>{pick(lang, '查看推荐服务', 'Review featured services')}</span>
                <span className="font-semibold text-stone-900">{services.filter((item) => item.isFeatured).length}</span>
              </Link>
              <Link href="/admin/services?filter=active" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                <span>{pick(lang, '巡检已上架服务', 'Inspect published services')}</span>
                <span className="font-semibold text-stone-900">{services.filter((item) => item.isActive).length}</span>
              </Link>
              <Link href="/admin/services/new" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                <span>{pick(lang, '新增服务条目', 'Create a new service')}</span>
                <span className="text-stone-500">→</span>
              </Link>
            </div>
          </AdminSectionCard>

          <AdminSectionCard
            eyebrow={pick(lang, '管理建议', 'Management notes')}
            title={pick(lang, '服务管理建议', 'Service management notes')}
            description={pick(lang, '先把服务条目整理干净，再继续补更细的封面、批量操作和内容模板能力。', 'Keep the service catalog clean first, then layer richer media, batch actions and templated editing on top.')}
            tone="dark"
          >
            <div className="space-y-4 text-sm leading-7 text-stone-300">
              <p>每个服务至少保持：双语名称、双语摘要、时长、价格、排序和上下架状态完整。</p>
              <p>如果后续要继续升级后台模板，服务表格会是最适合加入状态标签、筛选器和批量操作的页面之一。</p>
              <p>当前这页先保持“稳定可运营”，后面再继续上更复杂的模板化交互。</p>
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </AdminShell>
  )
}
