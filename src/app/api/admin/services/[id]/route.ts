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
      return NextResponse.json({ status: 'error', error: 'Invalid service id' }, { status: 400 })
    }

    const item = await prisma.service.update({
      where: { id },
      data: {
        slug: typeof json.slug === 'string' ? json.slug : undefined,
        nameDe: typeof json.nameDe === 'string' ? json.nameDe : undefined,
        nameEn: typeof json.nameEn === 'string' ? json.nameEn : undefined,
        summaryDe: typeof json.summaryDe === 'string' ? json.summaryDe : undefined,
        summaryEn: typeof json.summaryEn === 'string' ? json.summaryEn : undefined,
        descriptionDe: typeof json.descriptionDe === 'string' ? json.descriptionDe : undefined,
        descriptionEn: typeof json.descriptionEn === 'string' ? json.descriptionEn : undefined,
        durationMin: typeof json.durationMin === 'number' ? json.durationMin : undefined,
        price: typeof json.price === 'number' ? json.price : undefined,
        sortOrder: typeof json.sortOrder === 'number' ? json.sortOrder : undefined,
        isActive: typeof json.isActive === 'boolean' ? json.isActive : undefined,
        isFeatured: typeof json.isFeatured === 'boolean' ? json.isFeatured : undefined,
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

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = Number(params.id)

    if (!Number.isFinite(id)) {
      return NextResponse.json({ status: 'error', error: 'Invalid service id' }, { status: 400 })
    }

    const appointmentsCount = await prisma.appointment.count({ where: { serviceId: id } })
    if (appointmentsCount > 0) {
      return NextResponse.json({ status: 'error', error: 'Cannot delete service with related appointments' }, { status: 400 })
    }

    await prisma.service.delete({ where: { id } })
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
