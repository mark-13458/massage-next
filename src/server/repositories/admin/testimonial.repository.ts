import { prisma } from '../../../lib/prisma'

export async function findAdminTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function findAdminTestimonialById(id: number) {
  return prisma.testimonial.findUnique({ where: { id } })
}

export async function createTestimonial(data: {
  customerName: string
  locale: string
  rating: number
  content: string
  sortOrder: number
  isPublished: boolean
}) {
  return prisma.testimonial.create({ data })
}

export async function updateTestimonial(id: number, data: {
  customerName?: string
  locale?: string
  rating?: number
  content?: string
  sortOrder?: number
  isPublished?: boolean
}) {
  return prisma.testimonial.update({ where: { id }, data })
}

export async function deleteTestimonial(id: number) {
  return prisma.testimonial.delete({ where: { id } })
}
