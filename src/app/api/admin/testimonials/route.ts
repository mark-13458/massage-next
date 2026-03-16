import { revalidateTag } from 'next/cache'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminTestimonials, createTestimonial } from '../../../../server/services/admin-testimonial.service'
import { CACHE_TAGS } from '../../../../server/services/site.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)
  const items = await getAdminTestimonials()
  return apiOk({ items })
}

export async function POST(req: Request) {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { customerName, locale, rating, content, sortOrder, isPublished } = body

    if (!customerName || !content) return apiError('customerName and content are required', 400)

    const item = await createTestimonial({
      customerName: String(customerName).trim(),
      locale: locale === 'en' ? 'en' : 'de',
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      content: String(content).trim(),
      sortOrder: Number(sortOrder) || 0,
      isPublished: isPublished !== false,
    })
    revalidateTag(CACHE_TAGS.testimonials)
    return apiOk({ item })
  } catch {
    return apiError('Failed to create testimonial', 500)
  }
}
