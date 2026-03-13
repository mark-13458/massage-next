import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '../../../../../src/lib/prisma'
import { setAdminSession } from '../../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  try {
    const json = await request.json()
    const email = String(json.email || '').trim().toLowerCase()
    const password = String(json.password || '')

    if (!email || !password) {
      return NextResponse.json({ status: 'error', error: 'Email and password are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return NextResponse.json({ status: 'error', error: 'Invalid credentials' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ status: 'error', error: 'Invalid credentials' }, { status: 401 })
    }

    await setAdminSession(user.id, user.email)
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
