import { randomUUID } from 'crypto'
import { prisma } from '../../lib/prisma'
import { createAuditLog, logBookingAction } from './audit.service'

/**
 * 改约/取消 token 配置
 * Token 有效期：7 天
 */
export const APPOINTMENT_LINK_CONFIG = {
  TOKEN_EXPIRY_HOURS: 168, // 7 天
  TOKEN_LENGTH: 32,
}

/**
 * 生成改约 token
 */
export async function generateRescheduleToken(appointmentId: number) {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + APPOINTMENT_LINK_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  try {
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        rescheduleToken: token,
        rescheduleTokenExpires: expiresAt,
      },
    })

    return {
      token,
      expiresAt,
      url: `${process.env.APP_URL || 'http://localhost:3000'}/appointment/reschedule/${token}`,
    }
  } catch (error) {
    console.error('[RESCHEDULE_TOKEN] Error generating reschedule token:', error)
    return null
  }
}

/**
 * 生成取消 token
 */
export async function generateCancelToken(appointmentId: number) {
  const token = randomUUID()
  const expiresAt = new Date(Date.now() + APPOINTMENT_LINK_CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  try {
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        cancelToken: token,
        cancelTokenExpires: expiresAt,
      },
    })

    return {
      token,
      expiresAt,
      url: `${process.env.APP_URL || 'http://localhost:3000'}/appointment/cancel/${token}`,
    }
  } catch (error) {
    console.error('[CANCEL_TOKEN] Error generating cancel token:', error)
    return null
  }
}

/**
 * 验证并获取改约 token
 */
export async function validateRescheduleToken(token: string) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        rescheduleToken: token,
        rescheduleTokenExpires: {
          gt: new Date(),
        },
      },
    })

    if (!appointment) {
      return null
    }

    return appointment
  } catch (error) {
    console.error('[RESCHEDULE_TOKEN] Error validating token:', error)
    return null
  }
}

/**
 * 验证并获取取消 token
 */
export async function validateCancelToken(token: string) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        cancelToken: token,
        cancelTokenExpires: {
          gt: new Date(),
        },
      },
    })

    if (!appointment) {
      return null
    }

    return appointment
  } catch (error) {
    console.error('[CANCEL_TOKEN] Error validating token:', error)
    return null
  }
}

/**
 * 客户通过链接改约
 */
export async function rescheduleAppointmentByToken(
  token: string,
  newDate: Date,
  newTime: string,
  context?: { ipAddress?: string; userAgent?: string }
) {
  const appointment = await validateRescheduleToken(token)

  if (!appointment) {
    throw new Error('Invalid or expired reschedule link')
  }

  const oldDate = appointment.appointmentDate
  const oldTime = appointment.appointmentTime

  try {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        appointmentDate: newDate,
        appointmentTime: newTime,
        rescheduleToken: null,
        rescheduleTokenExpires: null,
      },
      include: { service: true },
    })

    // 记录改约历史
    await prisma.appointmentAudit.create({
      data: {
        appointmentId: appointment.id,
        appointmentUuid: appointment.uuid,
        action: 'RESCHEDULED',
        oldAppointmentDate: oldDate,
        oldAppointmentTime: oldTime,
        newAppointmentDate: newDate,
        newAppointmentTime: newTime,
        customerEmail: appointment.customerEmail,
      },
    })

    // 记录审计日志
    await createAuditLog({
      action: 'BOOKING_RESCHEDULED',
      entityType: 'APPOINTMENT',
      entityId: appointment.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      oldValue: {
        date: oldDate.toISOString(),
        time: oldTime,
      },
      newValue: {
        date: newDate.toISOString(),
        time: newTime,
      },
      additionalInfo: {
        method: 'CUSTOMER_LINK',
      },
    })

    return updated
  } catch (error) {
    console.error('[RESCHEDULE] Error rescheduling appointment:', error)
    throw error
  }
}

/**
 * 客户通过链接取消预约
 */
export async function cancelAppointmentByToken(
  token: string,
  reason?: string,
  context?: { ipAddress?: string; userAgent?: string }
) {
  const appointment = await validateCancelToken(token)

  if (!appointment) {
    throw new Error('Invalid or expired cancel link')
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelToken: null,
        cancelTokenExpires: null,
      },
      include: { service: true },
    })

    // 记录取消历史
    await prisma.appointmentAudit.create({
      data: {
        appointmentId: appointment.id,
        appointmentUuid: appointment.uuid,
        action: 'CANCELLED_BY_CUSTOMER',
        reason: reason || 'No reason provided',
        customerEmail: appointment.customerEmail,
      },
    })

    // 记录审计日志
    await createAuditLog({
      action: 'BOOKING_CANCELLED',
      entityType: 'APPOINTMENT',
      entityId: appointment.id,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      oldValue: {
        status: 'CONFIRMED',
      },
      newValue: {
        status: 'CANCELLED',
      },
      additionalInfo: {
        method: 'CUSTOMER_LINK',
        reason,
      },
    })

    return updated
  } catch (error) {
    console.error('[CANCEL] Error cancelling appointment:', error)
    throw error
  }
}

/**
 * 清理过期的 token（定期维护任务）
 */
export async function cleanupExpiredTokens() {
  if (!process.env.DATABASE_URL) {
    return { rescheduleCount: 0, cancelCount: 0 }
  }

  try {
    const now = new Date()

    const rescheduleResult = await prisma.appointment.updateMany({
      where: {
        rescheduleTokenExpires: {
          lt: now,
        },
        rescheduleToken: {
          not: null,
        },
      },
      data: {
        rescheduleToken: null,
        rescheduleTokenExpires: null,
      },
    })

    const cancelResult = await prisma.appointment.updateMany({
      where: {
        cancelTokenExpires: {
          lt: now,
        },
        cancelToken: {
          not: null,
        },
      },
      data: {
        cancelToken: null,
        cancelTokenExpires: null,
      },
    })

    console.log(
      `[CLEANUP] Cleared ${rescheduleResult.count} reschedule tokens and ${cancelResult.count} cancel tokens`
    )

    return {
      rescheduleCount: rescheduleResult.count,
      cancelCount: cancelResult.count,
    }
  } catch (error) {
    console.error('[CLEANUP] Error cleaning up tokens:', error)
    return { rescheduleCount: 0, cancelCount: 0 }
  }
}
