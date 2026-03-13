import { AppointmentStatus } from '@prisma/client'
import { formatDateDe, formatDateTimeDe, formatDurationMinutes } from './shared/formatters'

export type AdminBookingListItemViewModel = {
  id: number
  customerName: string
  notes: string | null
  serviceName: string
  appointmentDateLabel: string
  appointmentTimeLabel: string
  status: AppointmentStatus
  source: string
  customerPhone: string
  customerEmail: string | null
  createdAtLabel: string
  internalNote: string | null
}

export function toAdminBookingListItem(item: {
  id: number
  customerName: string
  notes: string | null
  appointmentDate: Date
  appointmentTime: string
  durationMin: number
  status: AppointmentStatus
  source: string
  customerPhone: string
  customerEmail: string | null
  createdAt: Date
  internalNote: string | null
  service: { nameDe: string }
}): AdminBookingListItemViewModel {
  return {
    id: item.id,
    customerName: item.customerName,
    notes: item.notes,
    serviceName: item.service.nameDe,
    appointmentDateLabel: formatDateDe(item.appointmentDate),
    appointmentTimeLabel: `${item.appointmentTime} · ${formatDurationMinutes(item.durationMin)}`,
    status: item.status,
    source: item.source,
    customerPhone: item.customerPhone,
    customerEmail: item.customerEmail,
    createdAtLabel: formatDateTimeDe(item.createdAt),
    internalNote: item.internalNote,
  }
}
