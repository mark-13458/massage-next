import { AppointmentStatus } from '@prisma/client'
import { formatDateDe, formatDateTimeDe, formatDurationMinutes } from './shared/formatters'
import { asRecord, readNestedRecord, readNullableString, readString } from './shared/mappers'

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

export function toAdminBookingListItem(item: unknown): AdminBookingListItemViewModel {
  const record = asRecord(item)
  if (!record) {
    return {
      id: 0,
      customerName: '',
      notes: null,
      serviceName: '',
      appointmentDateLabel: formatDateDe(new Date(0)),
      appointmentTimeLabel: ` · ${formatDurationMinutes(0)}`,
      status: AppointmentStatus.PENDING,
      source: '',
      customerPhone: '',
      customerEmail: null,
      createdAtLabel: formatDateTimeDe(new Date(0)),
      internalNote: null,
    }
  }

  const service = readNestedRecord(record, 'service')
  const appointmentDate = record.appointmentDate instanceof Date ? record.appointmentDate : new Date(0)
  const createdAt = record.createdAt instanceof Date ? record.createdAt : new Date(0)
  const durationMin = typeof record.durationMin === 'number' ? record.durationMin : 0
  const status = typeof record.status === 'string' ? (record.status as AppointmentStatus) : AppointmentStatus.PENDING

  return {
    id: typeof record.id === 'number' ? record.id : 0,
    customerName: readString(record, 'customerName'),
    notes: readNullableString(record, 'notes'),
    serviceName: service ? readString(service, 'nameDe') : '',
    appointmentDateLabel: formatDateDe(appointmentDate),
    appointmentTimeLabel: `${readString(record, 'appointmentTime')} · ${formatDurationMinutes(durationMin)}`,
    status,
    source: readString(record, 'source'),
    customerPhone: readString(record, 'customerPhone'),
    customerEmail: readNullableString(record, 'customerEmail'),
    createdAtLabel: formatDateTimeDe(createdAt),
    internalNote: readNullableString(record, 'internalNote'),
  }
}
