import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../../src/lib/api-response'
import { getCurrentAdmin } from '../../../../../src/lib/auth'
import { prisma } from '../../../../../src/lib/prisma'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_USAGES = new Set(['hero', 'gallery'])
const MIN_DIMENSIONS = {
  hero: { width: 1200, height: 600 },
  gallery: { width: 600, height: 400 },
} as const

type ImageDimensions = {
  width: number
  height: number
}

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24) return null
  if (buffer.toString('ascii', 1, 4) !== 'PNG') return null
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

function readGifDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 10) return null
  const signature = buffer.toString('ascii', 0, 6)
  if (signature !== 'GIF87a' && signature !== 'GIF89a') return null
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  }
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null

  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = buffer[offset + 1]
    if (!marker) break

    const isStartOfFrame = (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    )

    if (isStartOfFrame) {
      if (offset + 8 >= buffer.length) return null
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }

    if (offset + 3 >= buffer.length) return null
    const segmentLength = buffer.readUInt16BE(offset + 2)
    if (segmentLength < 2) return null
    offset += 2 + segmentLength
  }

  return null
}

function readWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 16) return null
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null

  const chunkType = buffer.toString('ascii', 12, 16)

  if (chunkType === 'VP8 ') {
    if (buffer.length < 30) return null
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    }
  }

  if (chunkType === 'VP8L') {
    if (buffer.length < 25) return null
    const value = buffer.readUInt32LE(21)
    return {
      width: (value & 0x3fff) + 1,
      height: ((value >> 14) & 0x3fff) + 1,
    }
  }

  if (chunkType === 'VP8X') {
    if (buffer.length < 30) return null
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    }
  }

  return null
}

function getImageDimensions(buffer: Buffer, mimeType: string): ImageDimensions | null {
  if (mimeType === 'image/png') return readPngDimensions(buffer)
  if (mimeType === 'image/gif') return readGifDimensions(buffer)
  if (mimeType === 'image/jpeg') return readJpegDimensions(buffer)
  if (mimeType === 'image/webp') return readWebpDimensions(buffer)
  return null
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const usage = String(formData.get('usage') || 'gallery')
    const titleDe = String(formData.get('titleDe') || '')
    const titleEn = String(formData.get('titleEn') || '')
    const altDe = String(formData.get('altDe') || '')
    const altEn = String(formData.get('altEn') || '')
    const sortOrder = Number(formData.get('sortOrder') || 0)
    const isActive = String(formData.get('isActive') || 'true') === 'true'
    const isCover = String(formData.get('isCover') || 'false') === 'true'

    if (!(file instanceof File)) {
      return apiError('No file uploaded', 400)
    }

    if (!ALLOWED_USAGES.has(usage)) {
      return apiError('Invalid upload usage', 400)
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return apiError('Only JPG, PNG, WEBP, and GIF uploads are allowed', 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError('File too large (max 10MB)', 400)
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const extension = EXTENSION_BY_MIME_TYPE[file.type]
    if (!extension) {
      return apiError('Unsupported image type', 400)
    }

    const storedFilename = `${randomUUID()}${extension}`
    const outputPath = path.join(uploadDir, storedFilename)
    const publicPath = `/uploads/${storedFilename}`

    const bytes = Buffer.from(await file.arrayBuffer())
    const dimensions = getImageDimensions(bytes, file.type)
    if (!dimensions) {
      return apiError('Unable to read image dimensions', 400)
    }

    const minDimensions = MIN_DIMENSIONS[usage as keyof typeof MIN_DIMENSIONS]
    if (dimensions.width < minDimensions.width || dimensions.height < minDimensions.height) {
      return apiError(`${usage === 'hero' ? 'Hero' : 'Gallery'} image must be at least ${minDimensions.width}x${minDimensions.height}`, 400)
    }

    await writeFile(outputPath, bytes)

    if (usage === 'hero') {
      return apiOk({
        item: {
          imageUrl: publicPath,
          width: dimensions.width,
          height: dimensions.height,
        },
      })
    }

    const createdFile = await prisma.file.create({
      data: {
        originalFilename: file.name,
        storedFilename,
        filePath: publicPath,
        fileSize: file.size,
        mimeType: file.type,
        kind: 'IMAGE',
        altText: altDe || altEn || null,
        width: dimensions.width,
        height: dimensions.height,
        isPublic: true,
        uploadedById: admin.id,
      },
    })

    if (usage === 'gallery' && isCover) {
      await prisma.galleryImage.updateMany({ data: { isCover: false }, where: { isCover: true } })
    }

    const gallery = await prisma.galleryImage.create({
      data: {
        titleDe: titleDe || null,
        titleEn: titleEn || null,
        altDe: altDe || null,
        altEn: altEn || null,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive,
        isCover,
        fileId: createdFile.id,
      },
      include: { file: true },
    })

    return apiOk({
      item: {
        id: gallery.id,
        titleDe: gallery.titleDe || '',
        titleEn: gallery.titleEn || '',
        altDe: gallery.altDe || '',
        altEn: gallery.altEn || '',
        imageUrl: gallery.file.filePath,
        width: dimensions.width,
        height: dimensions.height,
        sortOrder: gallery.sortOrder,
        isActive: gallery.isActive,
        isCover: gallery.isCover,
      },
    })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}
