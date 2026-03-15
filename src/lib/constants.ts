export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
export const MIN_DIMENSIONS = {
  hero: { width: 1200, height: 600 },
  gallery: { width: 600, height: 400 },
} as const
