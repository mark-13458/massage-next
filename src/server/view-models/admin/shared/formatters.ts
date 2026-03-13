export function formatDateDe(date: Date) {
  return new Intl.DateTimeFormat('de-DE').format(date)
}

export function formatDateTimeDe(date: Date) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatDurationMinutes(durationMin: number) {
  return `${durationMin} min`
}

export function formatPriceEuro(value: { toString(): string } | number | string) {
  return `€ ${value.toString()}`
}

export function formatImageDimensions(width: number | null, height: number | null) {
  return width && height ? `${width}×${height}` : '—'
}

export function pickBilingualText(primary?: string | null, secondary?: string | null, fallback = '') {
  return primary || secondary || fallback
}

export function detectMediaSource(filePath: string): 'local' | 'external' {
  return filePath.startsWith('/uploads/') ? 'local' : 'external'
}
