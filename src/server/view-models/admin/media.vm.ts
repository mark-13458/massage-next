import { detectMediaSource, formatImageDimensions } from './shared/formatters'
import { asRecord, mapFileAsset, pickLocalizedText, readBoolean, readNullableString, readString } from './shared/mappers'

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

export function toAdminGalleryCard(item: unknown): AdminGalleryCardViewModel {
  const record = asRecord(item)
  if (!record) {
    return {
      id: 0,
      title: '',
      altText: '',
      imageUrl: '',
      dimensionText: '—',
      sourceLabel: 'external',
      isActive: false,
      isCover: false,
      sortOrder: 0,
    }
  }

  const fileAsset = mapFileAsset(record)

  return {
    id: typeof record.id === 'number' ? record.id : 0,
    title: pickLocalizedText(record, 'titleDe', 'titleEn'),
    altText: pickLocalizedText(record, 'altDe', 'altEn'),
    imageUrl: fileAsset.imageUrl,
    dimensionText: formatImageDimensions(fileAsset.width, fileAsset.height),
    sourceLabel: detectMediaSource(fileAsset.imageUrl),
    isActive: readBoolean(record, 'isActive'),
    isCover: readBoolean(record, 'isCover'),
    sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : 0,
  }
}
