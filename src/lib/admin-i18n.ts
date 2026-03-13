import { cookies } from 'next/headers'
import { getSystemSettings } from '../server/services/site.service'

export type AdminLang = 'zh' | 'en'

export const ADMIN_LANG_COOKIE = 'massage_admin_lang'

export async function getAdminLang(): Promise<AdminLang> {
  const store = await cookies()
  const value = store.get(ADMIN_LANG_COOKIE)?.value
  if (value === 'en' || value === 'zh') return value

  try {
    const settings = await getSystemSettings()
    return settings?.adminDefaultLanguage === 'en' ? 'en' : 'zh'
  } catch {
    return 'zh'
  }
}

export function isAdminLang(value: string): value is AdminLang {
  return value === 'zh' || value === 'en'
}

export function pick<T>(lang: AdminLang, zh: T, en: T): T {
  return lang === 'en' ? en : zh
}
