import { z } from 'zod'

// YYYY-MM-DD 格式校验
const dateRegex = /^\d{4}-\d{2}-\d{2}$/
// HH:MM 格式校验（允许 H:MM）
const timeRegex = /^\d{1,2}:\d{2}$/

function isFutureDate(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr)
  return !isNaN(d.getTime()) && d >= today
}

export const bookingSchema = z.object({
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().min(5).max(30),
  customerEmail: z.string().email().optional().or(z.literal('')),
  serviceId: z.number().int().positive(),
  appointmentDate: z
    .string()
    .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
    .refine(isFutureDate, 'Appointment date must be today or in the future'),
  appointmentTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').max(20),
  locale: z.enum(['de', 'en']).default('de'),
  notes: z.string().max(1000).optional(),
  privacyConsent: z.boolean().optional(),
  turnstileToken: z.string().optional().or(z.literal('')),
})

export const bookingManageSchema = z.object({
  action: z.enum(['cancel', 'reschedule']),
  appointmentDate: z
    .string()
    .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
    .refine(isFutureDate, 'Appointment date must be today or in the future')
    .optional(),
  appointmentTime: z.string().regex(timeRegex, 'Time must be in HH:MM format').max(20).optional(),
  notes: z.string().max(1000).optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type BookingManageInput = z.infer<typeof bookingManageSchema>
