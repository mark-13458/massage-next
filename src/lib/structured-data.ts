import type { Locale } from './i18n'

export type BusinessHourView = {
  weekday: number
  openTime?: string | null
  closeTime?: string | null
  isClosed: boolean
}

export type ContactView = {
  phone?: string | null
  email?: string | null
  address?: string | null
} | null

export type SystemSettingsView = {
  siteName?: string | null
} | null

const dayMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function toOpeningHoursSpecification(hours: BusinessHourView[] = []) {
  return hours
    .filter((item) => !item.isClosed && item.openTime && item.closeTime)
    .map((item) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayMap[(item.weekday - 1 + 7) % 7],
      opens: item.openTime,
      closes: item.closeTime,
    }))
}

export function buildLocalBusinessJsonLd({
  locale,
  contact,
  hours,
  settings,
  url,
}: {
  locale: Locale
  contact: ContactView
  hours?: BusinessHourView[]
  settings?: SystemSettingsView
  url: string
}) {
  const name = settings?.siteName || 'China TCM Massage'

  return {
    '@context': 'https://schema.org',
    '@type': ['HealthAndBeautyBusiness', 'LocalBusiness'],
    '@id': url,
    name,
    url,
    image: `${url}/og-image.jpg`,
    telephone: contact?.phone || undefined,
    email: contact?.email || undefined,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card',
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact?.address ?? 'Arnulfstraße 104',
      addressLocality: 'München',
      postalCode: '80636',
      addressCountry: 'DE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.1441,
      longitude: 11.5389,
    },
    areaServed: 'Munich',
    availableLanguage: locale === 'de' ? ['de', 'en'] : ['en', 'de'],
    openingHoursSpecification: toOpeningHoursSpecification(hours),
  }
}

export function buildServiceJsonLd({
  name,
  description,
  price,
  currency,
  url,
  providerName,
  providerUrl,
}: {
  name: string
  description?: string
  price: string | number
  currency: string
  url: string
  providerName: string
  providerUrl: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description: description || undefined,
    url,
    provider: {
      '@type': 'LocalBusiness',
      name: providerName,
      url: providerUrl,
    },
    offers: {
      '@type': 'Offer',
      price: String(price),
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    },
  }
}

export function buildWebSiteJsonLd({
  url,
  name,
  description,
}: {
  url: string
  name: string
  description?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url,
    name,
    description: description || undefined,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/services?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildFaqPageJsonLd(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function buildItemListJsonLd(items: { name: string; url: string }[]) {
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  }
}

export function buildImageGalleryJsonLd(
  images: { url: string; name: string; description?: string }[],
  providerName: string,
  providerUrl: string,
) {
  if (images.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: providerName,
    url: providerUrl,
    associatedMedia: images.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      name: img.name,
      description: img.description || img.name,
      author: {
        '@type': 'Organization',
        name: providerName,
        url: providerUrl,
      },
    })),
  }
}
