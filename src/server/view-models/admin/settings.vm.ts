import { asRecord, readBoolean, readEnum, readString } from './shared/mappers'

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
  const record = asRecord(value)
  if (!record) return null

  return {
    siteName: readString(record, 'siteName', 'China TCM Massage'),
    adminEmail: readString(record, 'adminEmail'),
    defaultFrontendLocale: readEnum(record, 'defaultFrontendLocale', ['de', 'en'] as const, 'de'),
    adminDefaultLanguage: readEnum(record, 'adminDefaultLanguage', ['zh', 'en'] as const, 'zh'),
    timezone: readString(record, 'timezone', 'Europe/Berlin'),
    currency: readString(record, 'currency', 'EUR'),
    bookingNoticeDe: readString(record, 'bookingNoticeDe', readString(record, 'bookingNoticeZh')),
    bookingNoticeEn: readString(record, 'bookingNoticeEn'),
    cfTurnstileEnabled: readBoolean(record, 'cfTurnstileEnabled'),
    cfTurnstileSiteKey: readString(record, 'cfTurnstileSiteKey'),
    cfTurnstileSecretKey: readString(record, 'cfTurnstileSecretKey'),
  }
}
