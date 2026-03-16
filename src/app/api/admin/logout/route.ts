import { NextRequest } from 'next/server'
import { apiOk } from '../../../../lib/api-response'
import { clearAdminSession } from '../../../../lib/auth'

export async function POST(_: NextRequest) {
  await clearAdminSession()
  return apiOk()
}
