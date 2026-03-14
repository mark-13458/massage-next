import { NextRequest } from 'next/server'
import { AppointmentStatus } from '@prisma/client'
import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
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
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const id = Number(params.id)
    const json = await request.json()
    const nextStatus = String(json.status || '').toUpperCase() as AppointmentStatus
    const internalNote = typeof json.internalNote === 'string' ? json.internalNote : undefined

    if (!Number.isFinite(id)) {
      return apiError('Invalid appointment id', 400)
    }

    if (!allowedStatuses.has(nextStatus)) {
      return apiError('Invalid appointment status', 400)
    }

    const data: Record<string, unknown> = {
      status: nextStatus,
    }

    if (typeof internalNote !== 'undefined') {
      data.internalNote = internalNote || null
    }

    if (nextStatus === AppointmentStatus.CONFIRMED) {
      data.confirmedAt = new Date()
      data.confirmedById = admin.id
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

    return apiOk({ item })
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}
