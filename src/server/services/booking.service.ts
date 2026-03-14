import { AppointmentSource, AppointmentStatus } from '@prisma/client'
import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { BookingInput } from '../../lib/validations/booking'

export async function createBooking(input: BookingInput) {
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } })

  if (!service || !service.isActive) {
    throw new Error('Service not found')
  }

  return prisma.appointment.create({
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
}
