import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { GalleryQuickActions } from '../../../components/admin/GalleryQuickActions'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminStatGrid } from '../../../components/admin/AdminStatGrid'
import { AdminWorkspaceLayout } from '../../../components/admin/AdminWorkspaceLayout'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminGalleryOverview } from '../../../server/services/admin-media.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const allowedFilters = ['all', 'active', 'inactive', 'cover', 'local'] as const

type GalleryFilter = (typeof allowedFilters)[number]

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const resolvedSearchParams = (await searchParams) ?? {}
  const rawFilter = String(resolvedSearchParams.filter || 'all').toLowerCase()
  const selectedFilter = (allowedFilters.includes(rawFilter as GalleryFilter) ? rawFilter : 'all') as GalleryFilter
  const { items, stats } = await getAdminGalleryOverview(selectedFilter)

  const filters = [
    { key: 'all', labelZh: '全部', labelEn: 'All' },
    { key: 'active', labelZh: '启用中', labelEn: 'Active' },
    { key: 'inactive', labelZh: '已停用', labelEn: 'Inactive' },
    { key: 'cover', labelZh: '封面', labelEn: 'Cover' },
    { key: 'local', labelZh: '本地上传', labelEn: 'Local uploads' },
  ] as const

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '图库管理', 'Gallery management')}
      subtitle={pick(
        lang,
        '把图片资料作为独立运营模块查看：快速检查封面、启用状态、本地上传占比，并跳转到内容页继续编辑。',
        'Treat the gallery as a dedicated operations module: quickly inspect covers, active states, local uploads, and jump into content editing when needed.',
      )}
    >
      <AdminWorkspaceLayout
        main={
          <AdminSectionCard
            eyebrow={pick(lang, '图片资料库', 'Gallery library')}
            title={pick(lang, '图片资料总览', 'Gallery library overview')}
            description={pick(
              lang,
              '这一页先解决“快速看全图库状态”的问题；具体新增、上传、替换仍然复用现有内容管理页。',
              'This page solves the fast overview problem first; creation, upload and replacement continue to reuse the existing content workspace.',
            )}
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/admin/content"
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
                >
                  {pick(lang, '前往内容管理页', 'Open content workspace')}
                </Link>
              </div>
            }
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {filters.map((filter) => {
                const href = filter.key === 'all' ? '/admin/gallery' : `/admin/gallery?filter=${filter.key}`
                const active = selectedFilter === filter.key

                return (
                  <Link
                    key={filter.key}
                    href={href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      active ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {pick(lang, filter.labelZh, filter.labelEn)}
                  </Link>
                )
              })}
            </div>

            {items.length === 0 ? (
              <AdminEmptyState
                title={pick(lang, '当前筛选下没有图库图片', 'No gallery images match the current filter')}
                description={pick(
                  lang,
                  '你可以切换筛选条件，或者去内容管理页上传第一张图库图片。',
                  'Try a different filter, or go to the content workspace to upload the first gallery image.',
                )}
              />
            ) : (
              <div className="grid gap-4">
                {items.map((item) => {
                  const sourceLabel = item.sourceLabel === 'local'
                    ? pick(lang, '本地上传', 'Local upload')
                    : pick(lang, '外部链接/历史资源', 'External or legacy asset')

                  return (
                    <article
                      key={item.id}
                      className="grid gap-4 rounded-3xl border border-stone-100 bg-[linear-gradient(180deg,#fff_0%,#fcfbf9_100%)] p-5 md:grid-cols-[180px_1fr]"
                    >
                      <img
                        src={item.imageUrl || 'https://placehold.co/640x480?text=Gallery'}
                        alt={item.altText || item.title || 'Gallery image'}
                        className="h-36 w-full rounded-[24px] border border-stone-200 object-cover"
                      />

                      <div className="grid gap-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-stone-900">
                              {item.title || pick(lang, '未命名图片', 'Untitled image')}
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                              {item.altText || pick(lang, '暂无 alt 文本', 'No alt text yet')}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <span className={`rounded-full px-3 py-1 ${item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                              {item.isActive ? pick(lang, '启用中', 'Active') : pick(lang, '已停用', 'Inactive')}
                            </span>
                            {item.isCover ? (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                                {pick(lang, '当前封面', 'Current cover')}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <dl className="grid gap-3 text-sm text-stone-600 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">ID</dt>
                            <dd className="mt-1 font-medium text-stone-800">#{item.id}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">{pick(lang, '尺寸', 'Dimensions')}</dt>
                            <dd className="mt-1 font-medium text-stone-800">{item.dimensionText}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">{pick(lang, '排序', 'Sort')}</dt>
                            <dd className="mt-1 font-medium text-stone-800">{item.sortOrder}</dd>
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-[0.2em] text-stone-400">{pick(lang, '来源', 'Source')}</dt>
                            <dd className="mt-1 font-medium text-stone-800">{sourceLabel}</dd>
                          </div>
                        </dl>

                        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-xs leading-6 text-stone-500">
                          {item.imageUrl}
                        </div>

                        <GalleryQuickActions
                          id={item.id}
                          lang={lang}
                          initialActive={item.isActive}
                          initialCover={item.isCover}
                        />
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </AdminSectionCard>
        }
        aside={
          <>
            <AdminSectionCard
              eyebrow={pick(lang, '图片统计', 'Gallery stats')}
              title={pick(lang, '图片状态看板', 'Gallery status panel')}
              description={pick(
                lang,
                '先把高频巡检信息抽出来，减少每次都进长表单翻查图片状态。',
                'Pull the high-frequency inspection signals up front so you do not need to scan a long editor every time.',
              )}
              tone="dark"
            >
              <AdminStatGrid
                dark
                items={[
                  { label: pick(lang, '全部图片', 'All images'), value: stats.total },
                  { label: pick(lang, '启用图片', 'Active images'), value: stats.active },
                  { label: pick(lang, '封面数量', 'Cover count'), value: stats.covers },
                  { label: pick(lang, '本地上传', 'Local uploads'), value: stats.localUploads },
                ]}
              />
            </AdminSectionCard>

            <AdminSectionCard
              eyebrow={pick(lang, '图片建议', 'Gallery notes')}
              title={pick(lang, '建议的下一步', 'Suggested next steps')}
              description={pick(
                lang,
                '把图库单独拉出来后，下一轮可以继续做更专业的资源运营能力。',
                'Now that the gallery has its own surface, the next iteration can focus on more professional media operations.',
              )}
            >
              <div className="space-y-3 text-sm leading-7 text-stone-600">
                <p>1. {pick(lang, '补图片压缩与规范化导出，减少上传体积。', 'Add image compression and normalized exports to reduce upload weight.')}</p>
                <p>2. {pick(lang, '继续做图片元数据与替换策略统一。', 'Continue unifying metadata handling and replacement strategy.')}</p>
                <p>3. {pick(lang, '后续可扩展批量上传、筛选和 alt 文本质量检查。', 'Later this can grow into batch upload, filtering and alt-text quality checks.')}</p>
              </div>
            </AdminSectionCard>
          </>
        }
      />
    </AdminShell>
  )
}
