import { NextResponse } from 'next/server'
import { clearAdminSession } from '../../../../../src/lib/auth'

export async function POST() {
  await clearAdminSession()
  return NextResponse.json({ status: 'ok' })
}
