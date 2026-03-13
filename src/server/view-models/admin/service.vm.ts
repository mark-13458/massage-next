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

export function toAdminServiceListItem(item: {
  id: number
  nameDe: string
  nameEn: string
  summaryDe: string | null
  durationMin: number
  price: { toString(): string }
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  slug: string
}): AdminServiceListItemViewModel {
  return {
    id: item.id,
    nameDe: item.nameDe,
    nameEn: item.nameEn,
    summaryDe: item.summaryDe,
    durationLabel: `${item.durationMin} min`,
    priceLabel: `€ ${item.price.toString()}`,
    isActive: item.isActive,
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    slug: item.slug,
  }
}
