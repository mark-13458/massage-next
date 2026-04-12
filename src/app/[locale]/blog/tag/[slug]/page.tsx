import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../../../components/site/SiteHeader'
import { SiteFooter } from '../../../../../components/site/SiteFooter'
import { FloatingActions } from '../../../../../components/site/FloatingActions'
import { SectionShell } from '../../../../../components/site/SectionShell'
import { isLocale, Locale } from '../../../../../lib/i18n'
import { createPageMetadata } from '../../../../../lib/seo'
import { getPublishedArticles, getArticleTags, getSystemSettings } from '../../../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  const [tags, settings] = await Promise.all([
    getArticleTags(locale as Locale).catch(() => []),
    getSystemSettings().catch(() => null),
  ])

  const tag = tags.find((t) => t.slug === slug)
  if (!tag) return {}

  return createPageMetadata({
    locale,
    pathname: `/blog/tag/${slug}`,
    title: locale === 'de' ? `Artikel zu: ${tag.name}` : `Articles about: ${tag.name}`,
    description: locale === 'de'
      ? `${tag.count} Artikel zum Thema ${tag.name} – TCM, Massage und Wellness Tipps.`
      : `${tag.count} articles about ${tag.name} – TCM, massage and wellness tips.`,
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function BlogTagPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const typedLocale = locale as Locale
  const [articles, tags] = await Promise.all([
    getPublishedArticles(typedLocale).catch(() => []),
    getArticleTags(typedLocale).catch(() => []),
  ])

  const currentTag = tags.find((t) => t.slug === slug)
  if (!currentTag) notFound()

  const filteredArticles = articles.filter((a) => a.tags.some((t) => t.slug === slug))

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Thema' : 'Topic'}
        title={currentTag.name}
        description={
          typedLocale === 'de'
            ? `${filteredArticles.length} Artikel zum Thema "${currentTag.name}"`
            : `${filteredArticles.length} articles about "${currentTag.name}"`
        }
      >
        {/* Tags navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={`/${typedLocale}/blog`}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
          >
            {typedLocale === 'de' ? 'Alle Artikel' : 'All articles'}
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/${typedLocale}/blog/tag/${tag.slug}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tag.slug === slug
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-300 text-stone-700 hover:border-stone-500'
              }`}
            >
              {tag.name} ({tag.count})
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-card">
            <p className="font-serif text-lg font-semibold text-brown-900">
              {typedLocale === 'de' ? 'Keine Artikel zu diesem Thema' : 'No articles for this topic'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${typedLocale}/blog/${article.slug}`}
                className="group rounded-[2rem] border border-stone-200 bg-white shadow-card transition hover:shadow-lg"
              >
                {article.coverImageUrl && (
                  <div className="aspect-[16/9] overflow-hidden rounded-t-[2rem]">
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="font-serif text-lg font-semibold text-brown-900 group-hover:text-amber-800 transition">
                    {article.title}
                  </h2>
                  {article.summary && (
                    <p className="mt-2 text-sm text-brown-500 line-clamp-3">{article.summary}</p>
                  )}
                  {article.publishedAt && (
                    <p className="mt-3 text-xs text-stone-400">
                      {new Date(article.publishedAt).toLocaleDateString(typedLocale === 'de' ? 'de-DE' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionShell>
      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
