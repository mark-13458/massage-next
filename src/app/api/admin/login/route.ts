import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { apiError, apiOk } from '../../../../lib/api-response'
import { prisma } from '../../../../lib/prisma'
import { setAdminSession } from '../../../../lib/auth'
import { getIpAddress } from '../../../../lib/utils'

// In-memory store for failed login attempts
// Key: ip_address or email
// Value: { count: number; lastAttempt: number; blockedUntil: number }
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil: number }>()

// Configuration for brute-force protection
const MAX_LOGIN_ATTEMPTS = 5 // Max attempts before blocking
const BLOCK_DURATION_MS = 5 * 60 * 1000 // Block for 5 minutes

export async function POST(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const ip = getIpAddress(request) || 'unknown'

  try {
    const json = await request.json()
    const email = String(json.email || '').trim().toLowerCase()
    const password = String(json.password || '')

    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    // Check IP and email for existing blocks
    const ipAttempts = failedLoginAttempts.get(ip)
    const emailAttempts = failedLoginAttempts.get(email)
    const now = Date.now()

    if (ipAttempts && ipAttempts.blockedUntil > now) {
      return apiError('Too many failed login attempts from this IP. Please try again later.', 429)
    }
    if (emailAttempts && emailAttempts.blockedUntil > now) {
      return apiError('Too many failed login attempts for this email. Please try again later.', 429)
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // If user not found or inactive, still increment attempt count to prevent enumeration
    if (!user || !user.isActive) {
      recordFailedAttempt(ip, email, now)
      return apiError('Invalid credentials', 401)
    }

    const ok = await bcrypt.compare(password, user.passwordHash)

    if (!ok) {
      recordFailedAttempt(ip, email, now)
      return apiError('Invalid credentials', 401)
    }

    // Clear failed attempts on successful login
    failedLoginAttempts.delete(ip)
    failedLoginAttempts.delete(email)

    await setAdminSession(user.id, user.email)
    return apiOk()
  } catch (error) {
    recordFailedAttempt(ip, 'unknown-email', Date.now())
    console.error('[admin/login] unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}

function recordFailedAttempt(ip: string, email: string, now: number) {
  // Update IP attempts
  const currentIpAttempts = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: 0, blockedUntil: 0 }
  currentIpAttempts.count++
  currentIpAttempts.lastAttempt = now
  if (currentIpAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    currentIpAttempts.blockedUntil = now + BLOCK_DURATION_MS
    currentIpAttempts.count = 0 // Reset count after blocking
  }
  failedLoginAttempts.set(ip, currentIpAttempts)

  // Update email attempts
  const currentEmailAttempts = failedLoginAttempts.get(email) || { count: 0, lastAttempt: 0, blockedUntil: 0 }
  currentEmailAttempts.count++
  currentEmailAttempts.lastAttempt = now
  if (currentEmailAttempts.count >= MAX_LOGIN_ATTEMPTS) {
    currentEmailAttempts.blockedUntil = now + BLOCK_DURATION_MS
    currentEmailAttempts.count = 0 // Reset count after blocking
  }
  failedLoginAttempts.set(email, currentEmailAttempts)

  // Clean up old entries to prevent memory leak (e.g., every 100 failed attempts or so)
  if (failedLoginAttempts.size > 1000) { // Arbitrary limit
    cleanUpFailedAttempts()
  }
}

function cleanUpFailedAttempts() {
  const now = Date.now()
  for (const [key, value] of failedLoginAttempts.entries()) {
    // Remove entries that are no longer blocked and haven't had recent attempts
    if (value.blockedUntil < now && (now - value.lastAttempt > BLOCK_DURATION_MS * 2)) { // Keep for a bit longer than block duration
      failedLoginAttempts.delete(key)
    }
  }
}