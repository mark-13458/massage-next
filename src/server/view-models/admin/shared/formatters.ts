// -- Shared Formatters --

/**
 * Format a JavaScript Date to German locale date string (e.g. 13.03.2026)
 */
export function formatDateDe(date: Date) {
  return new Intl.DateTimeFormat('de-DE').format(date)
}

/**
 * Format a JavaScript Date to German locale date + time string (e.g. 13.03.2026, 14:30)
 */
export function formatDateTimeDe(date: Date) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/**
 * Format minutes into "X min" string
 */
export function formatDurationMinutes(durationMin: number) {
  return `${durationMin} min`
}

/**
 * Format a numeric value as EUR using German locale rules.
 */
export function formatPriceEuro(value: { toString(): string } | number | string) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return `€ ${value.toString()}`
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(numericValue) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numericValue)
}

/**
 * Format dimensions (width x height) or return placeholder
 */
export function formatImageDimensions(width: number | null, height: number | null) {
  return width && height ? `${width}×${height}` : '—'
}

/**
 * Pick primary string, fallback to secondary, or empty string
 */
export function pickBilingualText(primary?: string | null, secondary?: string | null, fallback = '') {
  return primary || secondary || fallback
}

/**
 * Detect if a file path is local (starts with /uploads/) or external
 */
export function detectMediaSource(filePath: string): 'local' | 'external' {
  return filePath.startsWith('/uploads/') ? 'local' : 'external'
}
