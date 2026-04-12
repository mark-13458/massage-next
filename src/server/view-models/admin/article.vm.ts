import { formatDateTimeDe } from './shared/formatters'
import { asRecord, readBoolean, readNullableString, readString } from './shared/mappers'

export type AdminArticleListItemViewModel = {
  id: number
  titleDe: string
  titleEn: string
  slug: string
  isPublished: boolean
  publishedAt: string | null
  source: string
  sortOrder: number
  coverImageUrl: string | null
  tagNames: string[]
  keywordText: string | null
}

export function toAdminArticleListItem(item: unknown): AdminArticleListItemViewModel {
  const record = asRecord(item)
  if (!record) {
    return {
      id: 0, titleDe: '', titleEn: '', slug: '', isPublished: false,
      publishedAt: null, source: 'MANUAL', sortOrder: 0,
      coverImageUrl: null, tagNames: [], keywordText: null,
    }
  }

  // 封面图：优先 File 关联，其次外部 URL
  let coverImageUrl: string | null = null
  const coverImage = asRecord(record.coverImage)
  if (coverImage) {
    coverImageUrl = readString(coverImage, 'filePath') || null
  }
  if (!coverImageUrl) {
    coverImageUrl = readNullableString(record, 'coverImageUrl')
  }

  // 标签
  const tagNames: string[] = []
  if (Array.isArray(record.tags)) {
    for (const rel of record.tags) {
      const r = asRecord(rel)
      const tag = r ? asRecord(r.tag) : null
      if (tag) tagNames.push(readString(tag, 'nameDe'))
    }
  }

  // 关键词
  let keywordText: string | null = null
  const kw = asRecord(record.keyword)
  if (kw) keywordText = readString(kw, 'keyword') || null

  // 发布时间
  let publishedAt: string | null = null
  if (record.publishedAt instanceof Date) {
    publishedAt = formatDateTimeDe(record.publishedAt)
  }

  return {
    id: typeof record.id === 'number' ? record.id : 0,
    titleDe: readString(record, 'titleDe'),
    titleEn: readString(record, 'titleEn'),
    slug: readString(record, 'slug'),
    isPublished: readBoolean(record, 'isPublished'),
    publishedAt,
    source: readString(record, 'source', 'MANUAL'),
    sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : 0,
    coverImageUrl,
    tagNames,
    keywordText,
  }
}
