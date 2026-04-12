import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../../components/site/SiteHeader'
import { SiteFooter } from '../../../../components/site/SiteFooter'
import { FloatingActions } from '../../../../components/site/FloatingActions'
import { isLocale, Locale } from '../../../../lib/i18n'
import { createPageMetadata, getBaseUrl } from '../../../../lib/seo'
import { getArticleBySlug, getPublishedArticles, getSystemSettings } from '../../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  const [article, settings] = await Promise.all([
    getArticleBySlug(slug, locale as Locale).catch(() => null),
    getSystemSettings().catch(() => null),
  ])

  if (!article) return {}

  return createPageMetadata({
    locale,
    pathname: `/blog/${slug}`,
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary || undefined,
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function BlogArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const typedLocale = locale as Locale
  const [article, allArticles, settings] = await Promise.all([
    getArticleBySlug(slug, typedLocale).catch(() => null),
    getPublishedArticles(typedLocale).catch(() => []),
    getSystemSettings().catch(() => null),
  ])

  if (!article) notFound()

  // Related articles: same tag, exclude current, max 3
  const articleTagSlugs = new Set(article.tags.map((t) => t.slug))
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug && a.tags.some((t) => articleTagSlugs.has(t.slug)))
    .slice(0, 3)

  const baseUrl = getBaseUrl().toString().replace(/\/$/, '')

  // Article JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription || article.summary,
    image: article.coverImageUrl || undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    url: `${baseUrl}/${typedLocale}/blog/${article.slug}`,
    author: {
      '@type': 'Organization',
      name: settings?.siteName || 'China TCM Massage',
    },
    publisher: {
      '@type': 'Organization',
      name: settings?.siteName || 'China TCM Massage',
      url: baseUrl,
    },
  }

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: typedLocale === 'de' ? 'Startseite' : 'Home', item: `${baseUrl}/${typedLocale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/${typedLocale}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SiteHeader locale={typedLocale} />

      <article className="mx-auto max-w-3xl px-6 py-16">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-stone-400">
          <Link href={`/${typedLocale}`} className="hover:text-stone-600">
            {typedLocale === 'de' ? 'Startseite' : 'Home'}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${typedLocale}/blog`} className="hover:text-stone-600">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-stone-600">{article.title}</span>
        </nav>

        {/* Cover image */}
        {article.coverImageUrl && (
          <div className="mb-8 overflow-hidden rounded-[2rem]">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {article.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/${typedLocale}/blog/tag/${tag.slug}`}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200 transition"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
          <h1 className="font-serif text-3xl font-bold text-brown-900 md:text-4xl leading-tight">
            {article.title}
          </h1>
          {article.publishedAt && (
            <p className="mt-3 text-sm text-stone-400">
              {new Date(article.publishedAt).toLocaleDateString(typedLocale === 'de' ? 'de-DE' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
        </header>

        {/* Content */}
        <div
          className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        {/* Back to blog */}
        <div className="mt-12 border-t border-stone-200 pt-8">
          <Link
            href={`/${typedLocale}/blog`}
            className="inline-flex rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
          >
            {typedLocale === 'de' ? '← Zurück zum Blog' : '← Back to blog'}
          </Link>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 font-serif text-2xl font-semibold text-brown-900">
              {typedLocale === 'de' ? 'Weitere Artikel' : 'Related articles'}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.id}
                  href={`/${typedLocale}/blog/${ra.slug}`}
                  className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-card transition hover:shadow-lg"
                >
                  {ra.coverImageUrl && (
                    <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl">
                      <img src={ra.coverImageUrl} alt={ra.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </div>
                  )}
                  <h3 className="font-serif text-sm font-semibold text-brown-900 group-hover:text-amber-800 transition line-clamp-2">
                    {ra.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <FloatingActions locale={typedLocale} />
      <SiteFooter locale={typedLocale} />
    </main>
  )
}
