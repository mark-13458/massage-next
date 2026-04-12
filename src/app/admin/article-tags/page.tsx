import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { TagManager } from '../../../components/admin/TagManager'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { prisma } from '../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminArticleTagsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const tags = await prisma.articleTag.findMany({
    orderBy: { nameDe: 'asc' },
    include: { _count: { select: { articles: true } } },
  }).catch(() => [])

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '文章标签', 'Article Tags')}
      subtitle={pick(lang, '管理博客文章的标签分类，用于前台标签筛选和 SEO 聚合页。', 'Manage blog article tags for frontend filtering and SEO tag pages.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/articles" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回文章管理', 'Back to articles')}
        </Link>
      </AdminPageToolbar>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminSectionCard
          eyebrow={pick(lang, '标签列表', 'Tag list')}
          title={pick(lang, '所有标签', 'All tags')}
          description={pick(lang, '标签用于文章分类和前台标签页聚合。', 'Tags are used for article categorization and frontend tag pages.')}
        >
          {tags.length === 0 ? (
            <AdminEmptyState
              title={pick(lang, '暂无标签', 'No tags yet')}
              description={pick(lang, '在右侧创建标签，或让 AI 生成文章时自动创建。', 'Create tags on the right, or let AI auto-create when generating articles.')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-100 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    {[
                      pick(lang, '标签名（德语）', 'Name (DE)'),
                      pick(lang, '标签名（英语）', 'Name (EN)'),
                      'Slug',
                      pick(lang, '文章数', 'Articles'),
                    ].map((label) => (
                      <th key={label} className="px-4 py-4 text-left font-semibold text-stone-700">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {tags.map((tag) => (
                    <tr key={tag.id}>
                      <td className="px-4 py-3 font-medium text-stone-900">{tag.nameDe}</td>
                      <td className="px-4 py-3 text-stone-700">{tag.nameEn}</td>
                      <td className="px-4 py-3 text-xs text-stone-500">{tag.slug}</td>
                      <td className="px-4 py-3 text-stone-700">{tag._count.articles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          eyebrow={pick(lang, '创建标签', 'Create tag')}
          title={pick(lang, '新建标签', 'New tag')}
          description={pick(lang, '填写双语标签名，slug 会自动从英文名生成。', 'Fill bilingual tag name. Slug is auto-generated from the English name.')}
        >
          <TagManager lang={lang} />
        </AdminSectionCard>
      </div>
    </AdminShell>
  )
}
