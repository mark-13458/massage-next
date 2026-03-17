import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { apiError, apiOk } from '../../../../lib/api-response'
import { prisma } from '../../../../lib/prisma'
import { setAdminSession } from '../../../../lib/auth'
import { getIpAddress } from '../../../../lib/utils'
import { env } from '../../../../lib/env'

// In-memory brute-force protection
// Key: "ip:<addr>" or "email:<addr>"
const failedAttempts = new Map<string, { count: number; blockedUntil: number }>()

const MAX_ATTEMPTS = 5
const BLOCK_MS = 5 * 60 * 1000 // 5 minutes

function isBlocked(key: string): boolean {
  const entry = failedAttempts.get(key)
  if (!entry) return false
  if (entry.blockedUntil > Date.now()) return true
  // Block expired — clean up
  failedAttempts.delete(key)
  return false
}

function recordFailure(key: string) {
  const entry = failedAttempts.get(key) ?? { count: 0, blockedUntil: 0 }
  entry.count++
  if (entry.count >= MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + BLOCK_MS
    entry.count = 0
  }
  failedAttempts.set(key, entry)

  // Prevent unbounded growth
  if (failedAttempts.size > 2000) {
    const now = Date.now()
    for (const [k, v] of failedAttempts) {
      if (v.blockedUntil < now) failedAttempts.delete(k)
    }
  }
}

function clearFailures(ip: string, email: string) {
  failedAttempts.delete(`ip:${ip}`)
  failedAttempts.delete(`email:${email}`)
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<string | null> {
  const secretKey = env.adminTurnstile.secretKey
  if (!secretKey) return null // not configured — skip

  if (!token) return 'Captcha token missing'

  const form = new URLSearchParams()
  form.set('secret', secretKey)
  form.set('response', token)
  if (ip !== 'unknown') form.set('remoteip', ip)

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      cache: 'no-store',
    })
    const json = await res.json() as { success?: boolean; 'error-codes'?: string[] }
    if (!json.success) return (json['error-codes'] ?? ['captcha_failed']).join(', ')
    return null
  } catch {
    return 'Captcha verification failed'
  }
}

// Math CAPTCHA token format: base64(a:b:answer:timestamp:nonce)
// Valid window: 10 minutes
const MATH_TOKEN_TTL_MS = 10 * 60 * 1000

function verifyMathToken(token: string | undefined): string | null {
  if (!token) return 'Math captcha token missing'
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length !== 5) return 'Invalid captcha token'
    const [aStr, bStr, answerStr, tsStr] = parts
    const a = parseInt(aStr, 10)
    const b = parseInt(bStr, 10)
    const answer = parseInt(answerStr, 10)
    const ts = parseInt(tsStr, 10)
    if (isNaN(a) || isNaN(b) || isNaN(answer) || isNaN(ts)) return 'Invalid captcha token'
    if (Date.now() - ts > MATH_TOKEN_TTL_MS) return 'Captcha expired, please refresh'
    if (answer !== a + b) return 'Captcha answer incorrect'
    return null
  } catch {
    return 'Invalid captcha token'
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const ip = getIpAddress(request) ?? 'unknown'
  const ipKey = `ip:${ip}`

  // IP-level block check (before parsing body to save work)
  if (isBlocked(ipKey)) {
    return apiError('Too many failed attempts. Please try again later.', 429)
  }

  try {
    const json = await request.json()
    const email = String(json.email ?? '').trim().toLowerCase()
    const password = String(json.password ?? '')
    const turnstileToken = typeof json.turnstileToken === 'string' ? json.turnstileToken : undefined
    const mathToken = typeof json.mathToken === 'string' ? json.mathToken : undefined

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    const emailKey = `email:${email}`

    if (isBlocked(emailKey)) {
      return apiError('Too many failed attempts. Please try again later.', 429)
    }

    const hasTurnstileSecret = Boolean(env.adminTurnstile.secretKey)

    if (hasTurnstileSecret) {
      // Turnstile configured — verify Turnstile token
      const captchaError = await verifyTurnstile(turnstileToken, ip)
      if (captchaError) return apiError(captchaError, 400)
    } else {
      // No Turnstile — require math captcha
      const mathError = verifyMathToken(mathToken)
      if (mathError) return apiError(mathError, 400)
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.isActive) {
      recordFailure(ipKey)
      recordFailure(emailKey)
      return apiError('Invalid credentials', 401)
    }

    const ok = await bcrypt.compare(password, user.passwordHash)

    if (!ok) {
      recordFailure(ipKey)
      recordFailure(emailKey)
      return apiError('Invalid credentials', 401)
    }

    clearFailures(ip, email)
    await setAdminSession(user.id, user.email)
    return apiOk()
  } catch (error) {
    recordFailure(ipKey)
    console.error('[admin/login] unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
