import { formatDurationMinutes, formatPriceEuro } from './shared/formatters'
import { asRecord, readBoolean, readNullableString, readString } from './shared/mappers'

export type AdminServiceListItemViewModel = {
  id: number
  nameDe: string
  nameEn: string
  summaryDe: string | null
  durationLabel: string
  priceLabel: string
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  slug: string
}

export function toAdminServiceListItem(item: unknown): AdminServiceListItemViewModel {
  const record = asRecord(item)
  if (!record) {
    return {
      id: 0,
      nameDe: '',
      nameEn: '',
      summaryDe: null,
      durationLabel: formatDurationMinutes(0),
      priceLabel: formatPriceEuro(0),
      isActive: false,
      isFeatured: false,
      sortOrder: 0,
      slug: '',
    }
  }

  return {
    id: typeof record.id === 'number' ? record.id : 0,
    nameDe: readString(record, 'nameDe'),
    nameEn: readString(record, 'nameEn'),
    summaryDe: readNullableString(record, 'summaryDe'),
    durationLabel: formatDurationMinutes(typeof record.durationMin === 'number' ? record.durationMin : 0),
    priceLabel: formatPriceEuro(typeof record.price === 'object' && record.price && 'toString' in record.price ? (record.price as { toString(): string }) : 0),
    isActive: readBoolean(record, 'isActive'),
    isFeatured: readBoolean(record, 'isFeatured'),
    sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : 0,
    slug: readString(record, 'slug'),
  }
}
