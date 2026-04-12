import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { KeywordImport } from '../../../components/admin/KeywordImport'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminKeywords } from '../../../server/services/admin-keyword.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminKeywordsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const keywords = await getAdminKeywords()
  const lang = await getAdminLang()

  const pending = keywords.filter((k) => k.status === 'PENDING')
  const used = keywords.filter((k) => k.status === 'USED')
  const skipped = keywords.filter((k) => k.status === 'SKIPPED')

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '关键词池', 'Keyword Pool')}
      subtitle={pick(lang, '管理 SEO 长尾关键词，AI 每天从池中取一个待用关键词自动生成文章。', 'Manage SEO long-tail keywords. AI picks one pending keyword daily to auto-generate articles.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/articles" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回文章管理', 'Back to articles')}
        </Link>
      </AdminPageToolbar>

      <div className="mb-6 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
          {pick(lang, `待用 ${pending.length}`, `Pending: ${pending.length}`)}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
          {pick(lang, `已用 ${used.length}`, `Used: ${used.length}`)}
        </span>
        <span className="rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-600">
          {pick(lang, `跳过 ${skipped.length}`, `Skipped: ${skipped.length}`)}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminSectionCard
          eyebrow={pick(lang, '关键词列表', 'Keyword list')}
          title={pick(lang, '所有关键词', 'All keywords')}
          description={pick(lang, '状态：待用（等待 AI 生成）、已用（已生成文章）、跳过（手动跳过）', 'Status: Pending (waiting for AI), Used (article generated), Skipped (manually skipped)')}
        >
          {keywords.length === 0 ? (
            <AdminEmptyState
              title={pick(lang, '暂无关键词', 'No keywords yet')}
              description={pick(lang, '在右侧批量导入关键词，AI 将每天取一个自动生成文章。', 'Import keywords on the right. AI will pick one daily for article generation.')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-100 text-sm">
                <thead className="bg-stone-50">
                  <tr>
                    {[
                      pick(lang, '关键词', 'Keyword'),
                      pick(lang, '语言', 'Locale'),
                      pick(lang, '状态', 'Status'),
                      pick(lang, '关联文章', 'Article'),
                    ].map((label) => (
                      <th key={label} className="px-4 py-4 text-left font-semibold text-stone-700">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {keywords.map((kw) => (
                    <tr key={kw.id} className="align-top">
                      <td className="px-4 py-3 font-medium text-stone-900">{kw.keyword}</td>
                      <td className="px-4 py-3 text-stone-500 uppercase">{kw.locale}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          kw.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                          kw.status === 'USED' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {kw.status === 'PENDING' ? pick(lang, '待用', 'Pending') :
                           kw.status === 'USED' ? pick(lang, '已用', 'Used') :
                           pick(lang, '跳过', 'Skipped')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {kw.article ? (
                          <Link href={`/admin/articles/${kw.article.id}`} className="text-xs text-amber-600 underline">
                            {kw.article.titleDe || kw.article.slug}
                          </Link>
                        ) : <span className="text-xs text-stone-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSectionCard>

        <AdminSectionCard
          eyebrow={pick(lang, '批量导入', 'Batch import')}
          title={pick(lang, '导入关键词', 'Import keywords')}
          description={pick(lang, '每行一个关键词，粘贴后点击导入。建议从 Google Keyword Planner 或 SEO 工具获取。', 'One keyword per line. Recommended sources: Google Keyword Planner, Ubersuggest, Ahrefs.')}
        >
          <KeywordImport lang={lang} />
        </AdminSectionCard>
      </div>
    </AdminShell>
  )
}
