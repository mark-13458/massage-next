import { readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? '/app/public/uploads'
const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function fileResponseFromId(fileId: number): Promise<NextResponse | null> {
  const record = await prisma.file.findUnique({ where: { id: fileId } })
  if (!record) return null

  // filePath is like /uploads/xxx.webp — resolve against UPLOAD_DIR parent or public
  let absolutePath: string
  if (record.filePath.startsWith('/uploads/')) {
    const filename = record.filePath.replace('/uploads/', '')
    absolutePath = path.join(UPLOAD_DIR, filename)
  } else {
    absolutePath = path.join(PUBLIC_DIR, record.filePath)
  }

  const data = await readFile(absolutePath)
  return new NextResponse(data, {
    status: 200,
    headers: {
      'Content-Type': record.mimeType,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL('/favicon.ico', process.env.APP_URL ?? 'http://localhost:3000'), 302)
  }

  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'adminSystemSettings' } })
    const value = setting?.value as Record<string, unknown> | null | undefined

    const faviconFileId =
      value && typeof value.faviconFileId === 'number' && Number.isFinite(value.faviconFileId)
        ? value.faviconFileId
        : null

    const logoFileId =
      value && typeof value.logoFileId === 'number' && Number.isFinite(value.logoFileId)
        ? value.logoFileId
        : null

    // Priority 1: faviconFileId
    if (faviconFileId !== null) {
      try {
        const res = await fileResponseFromId(faviconFileId)
        if (res) return res
      } catch {
        // fall through to next priority
      }
    }

    // Priority 2: logoFileId
    if (logoFileId !== null) {
      try {
        const res = await fileResponseFromId(logoFileId)
        if (res) return res
      } catch {
        // fall through to static fallback
      }
    }
  } catch {
    // any DB error → fall through to static fallback
  }

  // Priority 3: static /favicon.ico
  try {
    const staticPath = path.join(PUBLIC_DIR, 'favicon.ico')
    const data = await readFile(staticPath)
    return new NextResponse(data, {
      status: 200,
      headers: { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    // static file also missing — return empty 200
    return new NextResponse(null, { status: 200 })
  }
}
