import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../components/admin/AdminShell'
import { GenerateArticleButton } from '../../../components/admin/GenerateArticleButton'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminArticles } from '../../../server/services/admin-article.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const allowedFilters = ['all', 'published', 'draft', 'ai'] as const
type ArticleFilter = (typeof allowedFilters)[number]

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string; q?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const articles = await getAdminArticles()
  const lang = await getAdminLang()
  const resolved = (await searchParams) ?? {}
  const rawFilter = String(resolved.filter || 'all').toLowerCase()
  const selectedFilter = (allowedFilters.includes(rawFilter as ArticleFilter) ? rawFilter : 'all') as ArticleFilter
  const searchQuery = String(resolved.q || '').trim().toLowerCase()

  const filters = [
    { key: 'all', labelZh: '全部', labelEn: 'All' },
    { key: 'published', labelZh: '已发布', labelEn: 'Published' },
    { key: 'draft', labelZh: '草稿', labelEn: 'Draft' },
    { key: 'ai', labelZh: 'AI 生成', labelEn: 'AI Generated' },
  ] as const

  const filteredArticles = articles.filter((item) => {
    const matchesFilter =
      selectedFilter === 'published' ? item.isPublished :
      selectedFilter === 'draft' ? !item.isPublished :
      selectedFilter === 'ai' ? item.source === 'AI_GENERATED' : true
    const matchesSearch = !searchQuery ||
      item.titleDe.toLowerCase().includes(searchQuery) ||
      item.titleEn.toLowerCase().includes(searchQuery) ||
      item.slug.toLowerCase().includes(searchQuery)
    return matchesFilter && matchesSearch
  })

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '文章管理', 'Articles')}
      subtitle={pick(lang, '管理博客文章，支持手动创建和 AI 自动生成。通过长尾关键词优化提升 SEO 排名。', 'Manage blog articles with manual creation and AI auto-generation for SEO long-tail keyword optimization.')}
    >
      <AdminPageToolbar>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回后台首页', 'Back to dashboard')}
        </Link>
        <Link href="/admin/keywords" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '关键词池', 'Keywords')}
        </Link>
        <Link href="/admin/article-tags" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '标签管理', 'Tags')}
        </Link>
        <GenerateArticleButton lang={lang} />
        <Link href="/admin/articles/new" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">
          {pick(lang, '新建文章', 'New article')}
        </Link>
      </AdminPageToolbar>

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `筛选结果 ${filteredArticles.length} 篇`, `Filtered: ${filteredArticles.length}`)}
          </span>
          <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
            {pick(lang, `全部文章 ${articles.length} 篇`, `Total: ${articles.length}`)}
          </span>
        </div>
        <form method="GET" action="/admin/articles" className="flex items-center gap-2">
          {selectedFilter !== 'all' && <input type="hidden" name="filter" value={selectedFilter} />}
          <input type="text" name="q" defaultValue={searchQuery} placeholder={pick(lang, '搜索标题或 slug…', 'Search title or slug…')} className="w-64 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-amber-500" />
          <button type="submit" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800">{pick(lang, '搜索', 'Search')}</button>
          {searchQuery && (
            <Link href={selectedFilter !== 'all' ? `/admin/articles?filter=${selectedFilter}` : '/admin/articles'} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">{pick(lang, '清除', 'Clear')}</Link>
          )}
        </form>
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((f) => {
            const href = f.key === 'all' ? '/admin/articles' : `/admin/articles?filter=${f.key}`
            const active = selectedFilter === f.key
            return (
              <Link key={f.key} href={href} className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'}`}>
                {pick(lang, f.labelZh, f.labelEn)}
              </Link>
            )
          })}
        </div>
      </div>

      <AdminSectionCard
        eyebrow={pick(lang, '文章资料库', 'Article library')}
        title={pick(lang, '文章列表', 'Article list')}
        description={pick(lang, '管理所有博客文章，支持手动编辑和 AI 批量生成。', 'Manage all blog articles with manual editing and AI batch generation.')}
      >
        {filteredArticles.length === 0 ? (
          <AdminEmptyState
            title={pick(lang, '暂无文章', 'No articles yet')}
            description={pick(lang, '创建第一篇文章，或配置关键词池让 AI 自动生成。', 'Create the first article or set up the keyword pool for AI auto-generation.')}
          />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                {pick(lang, `已发布 ${articles.filter((a) => a.isPublished).length}`, `Published: ${articles.filter((a) => a.isPublished).length}`)}
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-700">
                {pick(lang, `草稿 ${articles.filter((a) => !a.isPublished).length}`, `Draft: ${articles.filter((a) => !a.isPublished).length}`)}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                {pick(lang, `AI 生成 ${articles.filter((a) => a.source === 'AI_GENERATED').length}`, `AI: ${articles.filter((a) => a.source === 'AI_GENERATED').length}`)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-100 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    {[
                      pick(lang, '标题（德语）', 'Title (DE)'),
                      pick(lang, '标题（英语）', 'Title (EN)'),
                      pick(lang, '状态', 'Status'),
                      pick(lang, '来源', 'Source'),
                      pick(lang, '标签', 'Tags'),
                      pick(lang, '发布时间', 'Published'),
                      pick(lang, '操作', 'Actions'),
                    ].map((label) => (
                      <th key={label} className="px-4 py-4 text-left font-semibold text-stone-700">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {filteredArticles.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="max-w-xs font-semibold text-stone-900 truncate">{item.titleDe}</div>
                        <div className="mt-1 text-xs text-stone-400 truncate">{item.slug}</div>
                      </td>
                      <td className="px-4 py-4 text-stone-700 max-w-xs truncate">{item.titleEn}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                          {item.isPublished ? pick(lang, '已发布', 'Published') : pick(lang, '草稿', 'Draft')}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {item.source === 'AI_GENERATED' ? (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">AI</span>
                        ) : (
                          <span className="text-xs text-stone-500">{pick(lang, '手动', 'Manual')}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tagNames.map((tag) => (
                            <span key={tag} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{tag}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-stone-500">{item.publishedAt || '—'}</td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/articles/${item.id}`} className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-500">
                          {pick(lang, '编辑', 'Edit')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </AdminSectionCard>
    </AdminShell>
  )
}
