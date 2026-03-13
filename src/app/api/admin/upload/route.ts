import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../src/lib/prisma'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
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
      return NextResponse.json({ status: 'error', error: 'No file uploaded' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ status: 'error', error: 'Only image uploads are allowed' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ status: 'error', error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const extension = path.extname(file.name) || '.bin'
    const storedFilename = `${randomUUID()}${extension}`
    const outputPath = path.join(uploadDir, storedFilename)
    const publicPath = `/uploads/${storedFilename}`

    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(outputPath, bytes)

    if (usage === 'hero') {
      return NextResponse.json({
        status: 'ok',
        item: {
          imageUrl: publicPath,
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
        isPublic: true,
      },
    })

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

    return NextResponse.json({
      status: 'ok',
      item: {
        id: gallery.id,
        titleDe: gallery.titleDe || '',
        titleEn: gallery.titleEn || '',
        altDe: gallery.altDe || '',
        altEn: gallery.altEn || '',
        imageUrl: gallery.file.filePath,
        sortOrder: gallery.sortOrder,
        isActive: gallery.isActive,
        isCover: gallery.isCover,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
