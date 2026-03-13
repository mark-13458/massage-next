import { NextRequest } from 'next/server'
import { apiOk } from '../../../../../src/lib/api-response'
import { clearAdminSession } from '../../../../../src/lib/auth'

export async function POST(_: NextRequest) {
  await clearAdminSession()
  return apiOk()
}
