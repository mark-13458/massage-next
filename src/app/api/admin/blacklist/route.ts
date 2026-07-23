import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getBlacklist, addToBlacklist } from '../../../../server/services/booking-protection.service'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  const items = await getBlacklist()
  return apiOk({ items })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { type, value, reason } = body

  if (!['PHONE', 'EMAIL', 'IP'].includes(type) || !value || typeof value !== 'string') {
    return apiError('Invalid input', 400)
  }

  const item = await addToBlacklist(type, value.trim(), reason?.trim() || undefined)
  return apiOk({ item })
}
