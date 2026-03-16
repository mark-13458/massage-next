import { prisma } from '../../lib/prisma'

/**
 * 预约防护规则配置
 */
export const BOOKING_PROTECTION_CONFIG = {
  // 时间窗口（分钟）
  WINDOW_MINUTES: 60,
  // 时间窗口内最大预约数
  MAX_BOOKINGS_PER_WINDOW: 3,
  // 黑名单阈值（同一时间段违规次数）
  ABUSE_THRESHOLD: 5,
}

export interface FrequencyLimitInput {
  limitType: 'PHONE' | 'EMAIL' | 'IP'
  limitValue: string
  ipAddress?: string
}

/**
 * 检查是否超过频率限制
 */
export async function checkBookingFrequencyLimit(input: FrequencyLimitInput): Promise<{
  allowed: boolean
  remaining: number
  reason?: string
}> {
  if (!process.env.DATABASE_URL) {
    return { allowed: true, remaining: BOOKING_PROTECTION_CONFIG.MAX_BOOKINGS_PER_WINDOW }
  }

  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() - BOOKING_PROTECTION_CONFIG.WINDOW_MINUTES * 60 * 1000)

    // 查询时间窗口内的预约数
    const record = await prisma.bookingFrequencyLimit.findFirst({
      where: {
        limitType: input.limitType,
        limitValue: input.limitValue,
        lastAttemptAt: {
          gte: windowStart,
        },
      },
    })

    if (!record) {
      // 首次预约，创建新记录
      await prisma.bookingFrequencyLimit.create({
        data: {
          limitType: input.limitType,
          limitValue: input.limitValue,
          bookingCount: 1,
          lastAttemptAt: now,
          windowStart,
        },
      })
      return {
        allowed: true,
        remaining: BOOKING_PROTECTION_CONFIG.MAX_BOOKINGS_PER_WINDOW - 1,
      }
    }

    if (record.bookingCount >= BOOKING_PROTECTION_CONFIG.MAX_BOOKINGS_PER_WINDOW) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Too many booking attempts from ${input.limitType}. Please try again later.`,
      }
    }

    // 增加计数
    await prisma.bookingFrequencyLimit.update({
      where: { id: record.id },
      data: {
        bookingCount: record.bookingCount + 1,
        lastAttemptAt: now,
      },
    })

    return {
      allowed: true,
      remaining: BOOKING_PROTECTION_CONFIG.MAX_BOOKINGS_PER_WINDOW - record.bookingCount - 1,
    }
  } catch (error) {
    // P2002 = Prisma unique constraint violation (concurrent request race)
    // In that case the record was already created by the concurrent request — allow
    const isUniqueConflict = (error as any)?.code === 'P2002'
    if (!isUniqueConflict) {
      console.error('[BOOKING_PROTECTION] Error checking frequency limit:', error)
    }
    // Fail open to avoid blocking legitimate bookings on DB errors
    return { allowed: true, remaining: BOOKING_PROTECTION_CONFIG.MAX_BOOKINGS_PER_WINDOW }
  }
}

/**
 * 记录登录尝试
 */
export async function recordLoginAttempt(email: string, success: boolean, data?: {
  ipAddress?: string
  userAgent?: string
  failureReason?: string
}) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await prisma.loginAttempt.create({
      data: {
        email,
        success,
        ipAddress: data?.ipAddress,
        userAgent: data?.userAgent,
        failureReason: data?.failureReason,
      },
    })
  } catch (error) {
    console.error('[LOGIN] Error recording login attempt:', error)
    return null
  }
}

/**
 * 检查是否应该限制登录（防暴力破解）
 */
export async function checkLoginAttempts(email: string): Promise<{
  allowed: boolean
  failedAttempts: number
  reason?: string
}> {
  if (!process.env.DATABASE_URL) {
    return { allowed: true, failedAttempts: 0 }
  }

  try {
    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)

    // 检查最近 15 分钟内失败的登录尝试
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
    })

    const MAX_FAILED_ATTEMPTS = 5

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      return {
        allowed: false,
        failedAttempts,
        reason: `Too many failed login attempts. Please try again after 15 minutes.`,
      }
    }

    return {
      allowed: true,
      failedAttempts,
    }
  } catch (error) {
    console.error('[LOGIN] Error checking login attempts:', error)
    return { allowed: true, failedAttempts: 0 }
  }
}

/**
 * 清空过期的频率限制记录（定期维护）
 */
export async function cleanupExpiredFrequencyLimits() {
  if (!process.env.DATABASE_URL) {
    return 0
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 小时前

    const result = await prisma.bookingFrequencyLimit.deleteMany({
      where: {
        lastAttemptAt: {
          lt: cutoff,
        },
      },
    })

    console.log(`[CLEANUP] Removed ${result.count} expired frequency limit records`)
    return result.count
  } catch (error) {
    console.error('[CLEANUP] Error cleaning up frequency limits:', error)
    return 0
  }
}
