import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminAppointments } from '../../../../server/services/admin-booking.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  const items = await getAdminAppointments('ALL')
  return apiOk({ items })
}
