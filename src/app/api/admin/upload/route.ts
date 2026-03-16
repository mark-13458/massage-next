import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_USAGES = new Set(['hero', 'gallery'])
const MIN_DIMENSIONS = {
  hero: { width: 1200, height: 600 },
  gallery: { width: 600, height: 400 },
} as const

// GIF 不转 WebP，其余统一转 WebP
async function processImage(buffer: Buffer, mimeType: string): Promise<{
  data: Buffer
  width: number
  height: number
  outputMime: string
  extension: string
}> {
  if (mimeType === 'image/gif') {
    const meta = await sharp(buffer, { animated: false }).metadata()
    return {
      data: buffer,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      outputMime: 'image/gif',
      extension: '.gif',
    }
  }

  const image = sharp(buffer)
  const meta = await image.metadata()

  const output = await image
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true })

  return {
    data: output.data,
    width: output.info.width,
    height: output.info.height,
    outputMime: 'image/webp',
    extension: '.webp',
  }
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

    const rawBuffer = Buffer.from(await file.arrayBuffer())

    // 用 sharp 处理：读取尺寸 + 压缩转 WebP
    let processed: Awaited<ReturnType<typeof processImage>>
    try {
      processed = await processImage(rawBuffer, file.type)
    } catch {
      return apiError('Unable to process image', 400)
    }

    const { data, width, height, outputMime, extension } = processed

    if (width === 0 || height === 0) {
      return apiError('Unable to read image dimensions', 400)
    }

    const minDimensions = MIN_DIMENSIONS[usage as keyof typeof MIN_DIMENSIONS]
    if (width < minDimensions.width || height < minDimensions.height) {
      return apiError(
        `${usage === 'hero' ? 'Hero' : 'Gallery'} image must be at least ${minDimensions.width}×${minDimensions.height}px`,
        400,
      )
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const storedFilename = `${randomUUID()}${extension}`
    const outputPath = path.join(uploadDir, storedFilename)
    const publicPath = `/uploads/${storedFilename}`

    await writeFile(outputPath, data)

    if (usage === 'hero') {
      return apiOk({
        item: {
          imageUrl: publicPath,
          width,
          height,
        },
      })
    }

    const createdFile = await prisma.file.create({
      data: {
        originalFilename: file.name,
        storedFilename,
        filePath: publicPath,
        fileSize: data.length,
        mimeType: outputMime,
        kind: 'IMAGE',
        altText: altDe || altEn || null,
        width,
        height,
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
        width,
        height,
        sortOrder: gallery.sortOrder,
        isActive: gallery.isActive,
        isCover: gallery.isCover,
      },
    })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}
