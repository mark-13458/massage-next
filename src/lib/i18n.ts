export const locales = ['de', 'en'] as const
export type Locale = (typeof locales)[number]

export const isLocale = (value: string): value is Locale => {
  return locales.includes(value as Locale)
}

export const localeLabels: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
}
