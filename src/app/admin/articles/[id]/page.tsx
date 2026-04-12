import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { ArticleForm } from '../../../../components/admin/ArticleForm'
import { DeleteArticleButton } from '../../../../components/admin/DeleteArticleButton'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { getAdminArticleDetail } from '../../../../server/services/admin-article.service'
import { prisma } from '../../../../lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isFinite(id)) notFound()

  const article = await getAdminArticleDetail(id)
  if (!article) notFound()

  const allTags = await prisma.articleTag.findMany({ orderBy: { nameDe: 'asc' } }).catch(() => [])

  // 获取封面图 URL
  let coverImageUrl: string | null = article.coverImageUrl || null
  if (!coverImageUrl && article.coverImage?.filePath) {
    coverImageUrl = article.coverImage.filePath
  }

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '编辑文章', 'Edit article')}
      subtitle={pick(lang, '编辑文章的双语内容、SEO 字段和发布状态。', 'Edit bilingual content, SEO fields and publishing status.')}
    >
      <AdminPageToolbar>
        <Link href="/admin/articles" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回文章列表', 'Back to articles')}
        </Link>
        <DeleteArticleButton id={article.id} lang={lang} />
      </AdminPageToolbar>
      <ArticleForm
        mode="edit"
        lang={lang}
        allTags={allTags}
        article={{
          id: article.id,
          slug: article.slug,
          titleDe: article.titleDe,
          titleEn: article.titleEn,
          summaryDe: article.summaryDe,
          summaryEn: article.summaryEn,
          contentDe: article.contentDe,
          contentEn: article.contentEn,
          seoTitleDe: article.seoTitleDe,
          seoTitleEn: article.seoTitleEn,
          seoDescriptionDe: article.seoDescriptionDe,
          seoDescriptionEn: article.seoDescriptionEn,
          seoKeywordsDe: article.seoKeywordsDe,
          seoKeywordsEn: article.seoKeywordsEn,
          coverImageId: article.coverImageId,
          coverImageUrl,
          isPublished: article.isPublished,
          publishedAt: article.publishedAt?.toISOString() ?? null,
          sortOrder: article.sortOrder,
          source: article.source,
          tagIds: article.tags.map((r) => r.tagId),
        }}
      />
    </AdminShell>
  )
}
