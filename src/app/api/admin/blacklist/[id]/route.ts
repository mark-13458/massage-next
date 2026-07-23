import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { removeFromBlacklist } from '../../../../../server/services/booking-protection.service'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin()
  if (!admin) return apiError('Unauthorized', 401)

  const { id } = await params
  const numId = Number(id)
  if (!Number.isFinite(numId)) return apiError('Invalid id', 400)

  await removeFromBlacklist(numId)
  return apiOk({ ok: true })
}
