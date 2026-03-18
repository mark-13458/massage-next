const DEFAULT_ADDRESS = 'Arnulfstraße 104, 80636 München'

export function buildMapEmbedUrl(address: string): string {
  const resolved = address.trim() || DEFAULT_ADDRESS
  return `https://maps.google.com/maps?q=${encodeURIComponent(resolved)}&output=embed`
}

interface MapEmbedProps {
  address: string
  locale: 'de' | 'en'
  height?: number
}

export function MapEmbed({ address, locale, height = 320 }: MapEmbedProps) {
  const title = locale === 'de' ? 'Standort auf der Karte' : 'Location on map'

  return (
    <iframe
      src={buildMapEmbedUrl(address)}
      title={title}
      width="100%"
      height={height}
      className="h-[220px] w-full sm:h-auto"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
    />
  )
}
