import {
  findAdminTestimonials,
  findAdminTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../repositories/admin/testimonial.repository'

export async function getAdminTestimonials() {
  if (!process.env.DATABASE_URL) return []
  try {
    return await findAdminTestimonials()
  } catch {
    return []
  }
}

export async function getAdminTestimonialById(id: number) {
  if (!process.env.DATABASE_URL) return null
  try {
    return await findAdminTestimonialById(id)
  } catch {
    return null
  }
}

export { createTestimonial, updateTestimonial, deleteTestimonial }
