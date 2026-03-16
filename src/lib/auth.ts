import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const COOKIE_NAME = 'massage_admin_session'

function getSecret() {
  return process.env.SESSION_SECRET || 'dev-session-secret'
}

function sign(value: string) {
  return createHmac('sha256', getSecret()).update(value).digest('hex')
}

export function createSessionValue(payload: string) {
  return `${payload}.${sign(payload)}`
}

export function verifySessionValue(value: string | undefined) {
  if (!value) return null
  const lastDot = value.lastIndexOf('.')
  if (lastDot <= 0) return null

  const payload = value.slice(0, lastDot)
  const signature = value.slice(lastDot + 1)
  const expected = sign(payload)

  try {
    const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    return isValid ? payload : null
  } catch {
    return null
  }
}

export async function getCurrentAdmin() {
  const store = await cookies()
  const raw = store.get(COOKIE_NAME)?.value
  const payload = verifySessionValue(raw)
  if (!payload) return null

  const [userId] = payload.split(':')
  const id = Number(userId)
  if (!Number.isFinite(id) || !process.env.DATABASE_URL) return null

  try {
    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    })
  } catch {
    return null
  }
}

export async function setAdminSession(userId: number, email: string) {
  const store = await cookies()
  const payload = `${userId}:${email}`
  store.set(COOKIE_NAME, createSessionValue(payload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8小时，middleware 每次请求滑动刷新
  })
}

export async function clearAdminSession() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
