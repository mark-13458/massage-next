import { z } from 'zod'

export const bookingSchema = z.object({
  customerName: z.string().min(2).max(80),
  customerPhone: z.string().min(5).max(30),
  customerEmail: z.string().email().optional().or(z.literal('')),
  serviceId: z.number().int().positive(),
  appointmentDate: z.string().min(1),
  appointmentTime: z.string().min(1).max(20),
  locale: z.enum(['de', 'en']).default('de'),
  notes: z.string().max(1000).optional(),
  privacyConsent: z.boolean().optional(),
  turnstileToken: z.string().optional().or(z.literal('')),
})

export const bookingManageSchema = z.object({
  action: z.enum(['cancel', 'reschedule']),
  appointmentDate: z.string().min(1).optional(),
  appointmentTime: z.string().min(1).max(20).optional(),
  notes: z.string().max(1000).optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type BookingManageInput = z.infer<typeof bookingManageSchema>
