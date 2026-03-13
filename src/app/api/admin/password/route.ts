import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'error', error: 'DATABASE_URL is not configured' }, { status: 500 })
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ status: 'error', error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json = await request.json()
    const currentPassword = String(json.currentPassword || '')
    const newPassword = String(json.newPassword || '')
    const confirmPassword = String(json.confirmPassword || '')

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ status: 'error', error: 'All password fields are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ status: 'error', error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ status: 'error', error: 'New password and confirmation do not match' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: admin.id } })
    if (!user) {
      return NextResponse.json({ status: 'error', error: 'Admin user not found' }, { status: 404 })
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ status: 'error', error: 'Current password is incorrect' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
