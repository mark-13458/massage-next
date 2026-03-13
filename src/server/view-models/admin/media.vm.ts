import { detectMediaSource, formatImageDimensions, pickBilingualText } from './shared/formatters'

export type AdminGalleryCardViewModel = {
  id: number
  title: string
  altText: string
  imageUrl: string
  dimensionText: string
  sourceLabel: 'local' | 'external'
  isActive: boolean
  isCover: boolean
  sortOrder: number
}

export function toAdminGalleryCard(item: {
  id: number
  titleDe: string | null
  titleEn: string | null
  altDe: string | null
  altEn: string | null
  sortOrder: number
  isActive: boolean
  isCover: boolean
  file: { filePath: string; width: number | null; height: number | null }
}): AdminGalleryCardViewModel {
  return {
    id: item.id,
    title: pickBilingualText(item.titleDe, item.titleEn),
    altText: pickBilingualText(item.altDe, item.altEn),
    imageUrl: item.file.filePath,
    dimensionText: formatImageDimensions(item.file.width, item.file.height),
    sourceLabel: detectMediaSource(item.file.filePath),
    isActive: item.isActive,
    isCover: item.isCover,
    sortOrder: item.sortOrder,
  }
}
