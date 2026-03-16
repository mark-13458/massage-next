import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { updateTestimonial, deleteTestimonial } from '../../../../../server/services/admin-testimonial.service'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isFinite(id)) return apiError('Invalid id', 400)

  try {
    const body = await req.json()
    const { customerName, locale, rating, content, sortOrder, isPublished } = body
    const item = await updateTestimonial(id, {
      ...(customerName !== undefined ? { customerName: String(customerName).trim() } : {}),
      ...(locale !== undefined ? { locale: locale === 'en' ? 'en' : 'de' } : {}),
      ...(rating !== undefined ? { rating: Math.min(5, Math.max(1, Number(rating))) } : {}),
      ...(content !== undefined ? { content: String(content).trim() } : {}),
      ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) || 0 } : {}),
      ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
    })
    return apiOk({ item })
  } catch {
    return apiError('Failed to update testimonial', 500)
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isFinite(id)) return apiError('Invalid id', 400)

  try {
    await deleteTestimonial(id)
    return apiOk({ deleted: true })
  } catch {
    return apiError('Failed to delete testimonial', 500)
  }
}
