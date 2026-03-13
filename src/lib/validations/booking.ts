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
  turnstileToken: z.string().optional().or(z.literal('')),
})

export type BookingInput = z.infer<typeof bookingSchema>
