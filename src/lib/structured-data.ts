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
  const siteName = settings?.siteName || 'China TCM Massage'

  return {
    '@context': 'https://schema.org',
    '@type': ['HealthAndBeautyBusiness', 'LocalBusiness'],
    '@id': url,
    name: siteName,
    url,
    telephone: contact?.phone || undefined,
    email: contact?.email || undefined,
    address: contact?.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: contact.address,
          addressLocality: 'München',
          addressCountry: 'DE',
        }
      : undefined,
    areaServed: 'Munich',
    availableLanguage: locale === 'de' ? ['de', 'en'] : ['en', 'de'],
    openingHoursSpecification: toOpeningHoursSpecification(hours),
  }
}
