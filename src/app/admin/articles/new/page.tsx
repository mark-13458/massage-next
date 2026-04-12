import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { ArticleForm } from '../../../../components/admin/ArticleForm'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewArticlePage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const allTags = await prisma.articleTag.findMany({ orderBy: { nameDe: 'asc' } }).catch(() => [])

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '新建文章', 'New article')}
      subtitle={pick(lang, '填写双语标题、正文和 SEO 信息，创建新的博客文章。', 'Fill in bilingual title, content and SEO info to create a new blog article.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/articles" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回文章列表', 'Back to articles')}
        </Link>
      </AdminPageToolbar>
      <ArticleForm mode="create" lang={lang} allTags={allTags} />
    </AdminShell>
  )
}
