import type { Metadata } from 'next'
import type { Locale } from './i18n'

const siteName = 'China TCM Massage'
const defaultTitle = {
  de: 'Traditionelle Chinesische Massage in München',
  en: 'Traditional Chinese Massage in Munich',
} satisfies Record<Locale, string>

const defaultDescription = {
  de: 'Moderne Wellness-Website für ein chinesisches Massagestudio in München – mit Behandlungen, Galerie, Kontakt und einfacher Terminanfrage.',
  en: 'Modern wellness website for a Chinese massage studio in Munich – with treatments, gallery, contact details and a simple appointment request flow.',
} satisfies Record<Locale, string>

export function getBaseUrl() {
  return new URL((process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, ''))
}

function normalizePathname(pathname: string) {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`
  }

  return pathname === '/' ? '' : pathname
}

export function getLocaleAlternates(pathname: string) {
  const normalized = normalizePathname(pathname)
  const base = getBaseUrl().toString().replace(/\/$/, '')

  return {
    canonical: `${base}/de${normalized}`,
    languages: {
      de: `${base}/de${normalized}`,
      en: `${base}/en${normalized}`,
      'x-default': `${base}/de${normalized}`,
    },
  }
}

export function createPageMetadata({
  locale,
  pathname,
  title,
  description,
  titleTemplate,
  siteNameOverride,
}: {
  locale: Locale
  pathname: string
  title?: string
  description?: string
  titleTemplate?: string
  siteNameOverride?: string
}): Metadata {
  const pageTitle = title ?? defaultTitle[locale]
  const pageDescription = description ?? defaultDescription[locale]
  const resolvedSiteName = siteNameOverride || siteName
  const resolvedTitle = titleTemplate && titleTemplate.includes('{page}')
    ? titleTemplate.replace('{page}', pageTitle)
    : `${pageTitle} | ${resolvedSiteName}`

  const base = getBaseUrl().toString().replace(/\/$/, '')
  const normalized = normalizePathname(pathname)

  return {
    title: resolvedTitle,
    description: pageDescription,
    alternates: {
      canonical: `${base}/${locale}${normalized}`,
      languages: {
        de: `${base}/de${normalized}`,
        en: `${base}/en${normalized}`,
        'x-default': `${base}/de${normalized}`,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: pageDescription,
      url: `${base}/${locale}${normalized}`,
      siteName: resolvedSiteName,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      alternateLocale: locale === 'de' ? 'en_US' : 'de_DE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: pageDescription,
    },
  }
}

export const defaultSiteMetadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: `${siteName}`,
  description: defaultDescription.de,
}
