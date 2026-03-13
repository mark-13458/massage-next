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

  return {
    canonical: `/de${normalized}`,
    languages: {
      de: `/de${normalized}`,
      en: `/en${normalized}`,
    },
  }
}

export function createPageMetadata({
  locale,
  pathname,
  title,
  description,
}: {
  locale: Locale
  pathname: string
  title?: string
  description?: string
}): Metadata {
  const pageTitle = title ?? defaultTitle[locale]
  const pageDescription = description ?? defaultDescription[locale]

  return {
    title: `${pageTitle} | ${siteName}`,
    description: pageDescription,
    alternates: getLocaleAlternates(pathname),
    openGraph: {
      title: `${pageTitle} | ${siteName}`,
      description: pageDescription,
      url: `/${locale}${normalizePathname(pathname)}`,
      siteName,
      locale: locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | ${siteName}`,
      description: pageDescription,
    },
  }
}

export const defaultSiteMetadata: Metadata = {
  metadataBase: getBaseUrl(),
  title: `${siteName}`,
  description: defaultDescription.de,
}
