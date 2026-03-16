import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const json = await request.json()
    const currentPassword = String(json.currentPassword || '')
    const newPassword = String(json.newPassword || '')
    const confirmPassword = String(json.confirmPassword || '')

    if (!currentPassword || !newPassword || !confirmPassword) {
      return apiError('All password fields are required', 400)
    }

    if (newPassword.length < 8) {
      return apiError('New password must be at least 8 characters', 400)
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return apiError('New password must contain at least one uppercase letter and one number', 400)
    }

    if (newPassword !== confirmPassword) {
      return apiError('New password and confirmation do not match', 400)
    }

    const user = await prisma.user.findUnique({ where: { id: admin.id } })
    if (!user) {
      return apiError('Admin user not found', 404)
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!ok) {
      return apiError('Current password is incorrect', 400)
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return apiOk()
  } catch (error) {
    console.error('[admin/password] unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
