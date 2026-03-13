import type { AdminLang } from './admin-i18n'

export function bookingSourceLabel(source: string, lang: AdminLang = 'zh') {
  const map: Record<string, { zh: string; en: string }> = {
    WEBSITE: { zh: '官网', en: 'Website' },
    PHONE: { zh: '电话', en: 'Phone' },
    WHATSAPP: { zh: 'WhatsApp', en: 'WhatsApp' },
    WALK_IN: { zh: '到店', en: 'Walk-in' },
    SETMORE: { zh: 'Setmore', en: 'Setmore' },
  }

  const item = map[source] || { zh: source, en: source }
  return lang === 'en' ? item.en : item.zh
}

export function localeLabel(locale: string, lang: AdminLang = 'zh') {
  const normalized = locale.toLowerCase()
  const map: Record<string, { zh: string; en: string }> = {
    de: { zh: '德语', en: 'German' },
    en: { zh: '英语', en: 'English' },
    zh: { zh: '中文', en: 'Chinese' },
  }

  const item = map[normalized] || { zh: locale, en: locale }
  return lang === 'en' ? item.en : item.zh
}
