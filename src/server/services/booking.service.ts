import { AppointmentSource, AppointmentStatus } from '@prisma/client'
import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { BookingInput } from '../../lib/validations/booking'
import { checkBookingFrequencyLimit } from './booking-protection.service'
import { createAuditLog } from './audit.service'

export async function createBooking(input: BookingInput, context?: {
  ipAddress?: string
  userAgent?: string
}) {
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } })

  if (!service || !service.isActive) {
    throw new Error('Service not found')
  }

  // 检查频率限制（可选，取决于配置）
  if (input.customerPhone) {
    const phoneCheck = await checkBookingFrequencyLimit({
      limitType: 'PHONE',
      limitValue: input.customerPhone,
      ipAddress: context?.ipAddress,
    })

    if (!phoneCheck.allowed) {
      throw new Error(phoneCheck.reason || 'Too many booking attempts')
    }
  }

  if (input.customerEmail) {
    const emailCheck = await checkBookingFrequencyLimit({
      limitType: 'EMAIL',
      limitValue: input.customerEmail,
      ipAddress: context?.ipAddress,
    })

    if (!emailCheck.allowed) {
      throw new Error(emailCheck.reason || 'Too many booking attempts')
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || null,
      locale: input.locale,
      appointmentDate: new Date(input.appointmentDate),
      appointmentTime: input.appointmentTime,
      durationMin: service.durationMin,
      priceSnapshot: service.price,
      notes: input.notes || null,
      status: AppointmentStatus.PENDING,
      source: AppointmentSource.WEBSITE,
      confirmationToken: randomUUID(),
      serviceId: service.id,
    },
    include: { service: true },
  })

  // 记录预约创建事件
  await createAuditLog({
    action: 'BOOKING_CREATED',
    entityType: 'APPOINTMENT',
    entityId: appointment.id,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    additionalInfo: {
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail,
      serviceId: service.id,
    },
  })

  return appointment
}
