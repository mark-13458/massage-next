import { NextRequest, NextResponse } from 'next/server'
import { AppointmentStatus } from '@prisma/client'
import { prisma } from '../../../../../lib/prisma'

const allowedStatuses = new Set([
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
])

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  try {
    const id = Number(params.id)
    const json = await request.json()
    const nextStatus = String(json.status || '').toUpperCase() as AppointmentStatus
    const internalNote = typeof json.internalNote === 'string' ? json.internalNote : undefined

    if (!Number.isFinite(id)) {
      return NextResponse.json({ status: 'error', error: 'Invalid appointment id' }, { status: 400 })
    }

    if (!allowedStatuses.has(nextStatus)) {
      return NextResponse.json({ status: 'error', error: 'Invalid appointment status' }, { status: 400 })
    }

    const data: Record<string, unknown> = {
      status: nextStatus,
    }

    if (typeof internalNote !== 'undefined') {
      data.internalNote = internalNote || null
    }

    if (nextStatus === AppointmentStatus.CONFIRMED) {
      data.confirmedAt = new Date()
    }

    if (nextStatus === AppointmentStatus.COMPLETED) {
      data.completedAt = new Date()
    }

    if (nextStatus === AppointmentStatus.CANCELLED) {
      data.cancelledAt = new Date()
    }

    const item = await prisma.appointment.update({
      where: { id },
      data,
    })

    return NextResponse.json({ status: 'ok', item })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
