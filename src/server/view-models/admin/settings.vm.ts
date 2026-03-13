export type AdminSettingsViewModel = {
  siteName: string
  adminEmail: string
  defaultFrontendLocale: 'de' | 'en'
  adminDefaultLanguage: 'zh' | 'en'
  timezone: string
  currency: string
  bookingNoticeDe: string
  bookingNoticeEn: string
  cfTurnstileEnabled: boolean
  cfTurnstileSiteKey: string
  cfTurnstileSecretKey: string
}

export function toAdminSettingsViewModel(value: unknown): AdminSettingsViewModel | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const record = value as Record<string, unknown>

  return {
    siteName: typeof record.siteName === 'string' ? record.siteName : 'China TCM Massage',
    adminEmail: typeof record.adminEmail === 'string' ? record.adminEmail : '',
    defaultFrontendLocale: record.defaultFrontendLocale === 'en' ? 'en' : 'de',
    adminDefaultLanguage: record.adminDefaultLanguage === 'en' ? 'en' : 'zh',
    timezone: typeof record.timezone === 'string' ? record.timezone : 'Europe/Berlin',
    currency: typeof record.currency === 'string' ? record.currency : 'EUR',
    bookingNoticeDe:
      typeof record.bookingNoticeDe === 'string'
        ? record.bookingNoticeDe
        : typeof record.bookingNoticeZh === 'string'
          ? record.bookingNoticeZh
          : '',
    bookingNoticeEn: typeof record.bookingNoticeEn === 'string' ? record.bookingNoticeEn : '',
    cfTurnstileEnabled: Boolean(record.cfTurnstileEnabled),
    cfTurnstileSiteKey: typeof record.cfTurnstileSiteKey === 'string' ? record.cfTurnstileSiteKey : '',
    cfTurnstileSecretKey: typeof record.cfTurnstileSecretKey === 'string' ? record.cfTurnstileSecretKey : '',
  }
}
