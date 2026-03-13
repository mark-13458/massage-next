export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export function readString(record: Record<string, unknown>, key: string, fallback = '') {
  return typeof record[key] === 'string' ? (record[key] as string) : fallback
}

export function readNullableString(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'string' ? (record[key] as string) : null
}

export function readBoolean(record: Record<string, unknown>, key: string, fallback = false) {
  return typeof record[key] === 'boolean' ? (record[key] as boolean) : fallback
}

export function readEnum<T extends string>(record: Record<string, unknown>, key: string, allowed: readonly T[], fallback: T) {
  const value = record[key]
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback
}

export function readNestedRecord(record: Record<string, unknown>, key: string) {
  return asRecord(record[key])
}

export function pickLocalizedText(record: Record<string, unknown>, primaryKey: string, secondaryKey: string, fallback = '') {
  return readString(record, primaryKey, readString(record, secondaryKey, fallback))
}

export function mapFileAsset(record: Record<string, unknown>) {
  const file = readNestedRecord(record, 'file')
  return {
    imageUrl: file ? readString(file, 'filePath') : '',
    width: file && typeof file.width === 'number' ? file.width : null,
    height: file && typeof file.height === 'number' ? file.height : null,
  }
}
