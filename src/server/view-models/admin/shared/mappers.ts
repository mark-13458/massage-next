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
