import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { apiError, apiOk } from '../../../../../src/lib/api-response'
import { prisma } from '../../../../../src/lib/prisma'
import { setAdminSession } from '../../../../../src/lib/auth'

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  try {
    const json = await request.json()
    const email = String(json.email || '').trim().toLowerCase()
    const password = String(json.password || '')

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isActive) {
      return apiError('Invalid credentials', 401)
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return apiError('Invalid credentials', 401)
    }

    await setAdminSession(user.id, user.email)
    return apiOk()
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Unknown error', 500)
  }
}
