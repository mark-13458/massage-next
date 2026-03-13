import { AdminLang } from './admin-i18n'

export const APPOINTMENT_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const
export type AppointmentStatusKey = (typeof APPOINTMENT_STATUS_OPTIONS)[number]

export function appointmentStatusLabel(status: string, lang: AdminLang = 'zh') {
  const map: Record<string, { zh: string; en: string }> = {
    ALL: { zh: '全部状态', en: 'All statuses' },
    PENDING: { zh: '待处理', en: 'Pending' },
    CONFIRMED: { zh: '已确认', en: 'Confirmed' },
    COMPLETED: { zh: '已完成', en: 'Completed' },
    CANCELLED: { zh: '已取消', en: 'Cancelled' },
    NO_SHOW: { zh: '爽约', en: 'No-show' },
  }

  const item = map[status] || { zh: status, en: status }
  return lang === 'en' ? item.en : item.zh
}
