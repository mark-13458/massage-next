import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  try {
    const json = await request.json()

    const item = await prisma.service.create({
      data: {
        slug: json.slug || `service-${Date.now()}`,
        nameDe: json.nameDe || '',
        nameEn: json.nameEn || '',
        summaryDe: json.summaryDe || null,
        summaryEn: json.summaryEn || null,
        descriptionDe: json.descriptionDe || null,
        descriptionEn: json.descriptionEn || null,
        durationMin: Number(json.durationMin) || 60,
        price: Number(json.price) || 0,
        sortOrder: Number(json.sortOrder) || 0,
        isFeatured: Boolean(json.isFeatured),
        isActive: typeof json.isActive === 'boolean' ? json.isActive : true,
      },
    })

    return NextResponse.json({ status: 'ok', item })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
