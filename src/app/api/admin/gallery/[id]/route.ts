import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = Number(params.id)
    const json = await request.json()

    if (!Number.isFinite(id)) {
      return NextResponse.json({ status: 'error', error: 'Invalid gallery id' }, { status: 400 })
    }

    const existing = await prisma.galleryImage.findUnique({
      where: { id },
      include: { file: true },
    })

    if (!existing) {
      return NextResponse.json({ status: 'error', error: 'Gallery item not found' }, { status: 404 })
    }

    const nextIsActive = typeof json.isActive === 'boolean' ? json.isActive : existing.isActive
    const nextIsCover = typeof json.isCover === 'boolean' ? json.isCover : existing.isCover

    if (nextIsCover) {
      await prisma.galleryImage.updateMany({
        where: { isCover: true, id: { not: id } },
        data: { isCover: false },
      })
    }

    const item = await prisma.galleryImage.update({
      where: { id },
      data: {
        isActive: nextIsActive,
        isCover: nextIsCover,
      },
      include: { file: true },
    })

    return NextResponse.json({
      status: 'ok',
      item: {
        id: item.id,
        isActive: item.isActive,
        isCover: item.isCover,
        imageUrl: item.file.filePath,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
