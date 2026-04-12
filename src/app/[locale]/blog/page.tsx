import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '../../../components/site/SiteHeader'
import { SiteFooter } from '../../../components/site/SiteFooter'
import { FloatingActions } from '../../../components/site/FloatingActions'
import { SectionShell } from '../../../components/site/SectionShell'
import { isLocale, Locale } from '../../../lib/i18n'
import { createPageMetadata } from '../../../lib/seo'
import { getPublishedArticles, getArticleTags, getSystemSettings } from '../../../server/services/site.service'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const settings = await getSystemSettings().catch(() => null)

  return createPageMetadata({
    locale,
    pathname: '/blog',
    title: locale === 'de' ? 'Blog & Ratgeber' : 'Blog & Guide',
    description:
      locale === 'de'
        ? 'Tipps und Fachwissen rund um TCM-Massage, Wellness und Gesundheit in München.'
        : 'Tips and expertise about TCM massage, wellness and health in Munich.',
    titleTemplate: locale === 'de' ? settings?.seoTitleTemplateDe : settings?.seoTitleTemplateEn,
    siteNameOverride: settings?.siteName,
  })
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const typedLocale = locale as Locale
  const [articles, tags] = await Promise.all([
    getPublishedArticles(typedLocale).catch(() => []),
    getArticleTags(typedLocale).catch(() => []),
  ])

  return (
    <main>
      <SiteHeader locale={typedLocale} />
      <SectionShell
        eyebrow={typedLocale === 'de' ? 'Ratgeber' : 'Guide'}
        title={typedLocale === 'de' ? 'Blog & Ratgeber' : 'Blog & Guide'}
        description={
          typedLocale === 'de'
            ? 'Erfahren Sie mehr über Traditionelle Chinesische Medizin, Massage-Techniken und Gesundheitstipps.'
            : 'Learn more about Traditional Chinese Medicine, massage techniques and health tips.'
        }
      >
        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href={`/${typedLocale}/blog`}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
            >
              {typedLocale === 'de' ? 'Alle Artikel' : 'All articles'}
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/${typedLocale}/blog/tag/${tag.slug}`}
                className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
              >
                {tag.name} ({tag.count})
              </Link>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-card">
            <p className="font-serif text-lg font-semibold text-brown-900">
              {typedLocale === 'de' ? 'Noch keine Artikel vorhanden' : 'No articles yet'}
            </p>
            <p className="mt-2 text-sm text-brown-500">
              {typedLocale === 'de'
                ? 'Bald finden Sie hier interessante Beiträge rund um TCM und Wellness.'
                : 'Soon you will find interesting articles about TCM and wellness here.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
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
                  {article.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <span key={tag.slug} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
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
