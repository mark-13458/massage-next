import { prisma } from '../../lib/prisma'
import { createAuditLog } from './audit.service'

/**
 * 隐私与数据保留配置
 */
export const PRIVACY_CONFIG = {
  // 数据保留天数（默认 180 天 = 6 个月）
  BOOKING_RETENTION_DAYS: 180,
  // 数据删除请求处理期限（天）
  DATA_DELETION_GRACE_PERIOD_DAYS: 30,
  // GDPR 要求：30 天内完成删除
}

/**
 * 记录隐私同意
 */
export async function recordPrivacyConsent(appointmentId: number) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    return await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        privacyConsent: true,
        privacyConsentAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[PRIVACY] Error recording consent:', error)
    return null
  }
}

/**
 * 请求数据删除
 * 遵循 GDPR 要求：客户可以请求删除个人数据
 */
export async function requestDataDeletion(appointmentId: number, email: string) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      throw new Error('Appointment not found')
    }

    // 验证邮箱匹配
    if (appointment.customerEmail !== email) {
      throw new Error('Email does not match appointment')
    }

    // 标记删除请求
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        dataDeleteRequestedAt: new Date(),
      },
    })

    // 记录审计日志
    await createAuditLog({
      action: 'DATA_DELETION_REQUESTED',
      entityType: 'APPOINTMENT',
      entityId: appointmentId,
      additionalInfo: {
        email,
        gracePeriodDays: PRIVACY_CONFIG.DATA_DELETION_GRACE_PERIOD_DAYS,
        willDeleteAt: new Date(
          Date.now() + PRIVACY_CONFIG.DATA_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
        ),
      },
    })

    return updated
  } catch (error) {
    console.error('[DATA_DELETION] Error requesting deletion:', error)
    return null
  }
}

/**
 * 执行数据删除
 * 在 grace period 后自动执行，或管理员手动触发
 */
export async function executeDataDeletion(appointmentId: number, adminId?: number) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    // 获取原始数据用于审计
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      throw new Error('Appointment not found')
    }

    const originalData = {
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      notes: appointment.notes,
    }

    // 删除敏感数据（但保留预约记录用于统计）
    const deleted = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        customerName: '[DELETED]',
        customerEmail: null,
        customerPhone: '[DELETED]',
        notes: null,
        internalNote: null,
        dataDeletedAt: new Date(),
      },
    })

    // 记录审计日志
    await createAuditLog({
      action: 'DATA_DELETED',
      entityType: 'APPOINTMENT',
      entityId: appointmentId,
      changedBy: adminId,
      oldValue: originalData,
      newValue: {
        customerName: '[DELETED]',
        customerPhone: '[DELETED]',
      },
      additionalInfo: {
        method: adminId ? 'MANUAL_ADMIN' : 'AUTOMATIC_RETENTION_POLICY',
      },
    })

    return deleted
  } catch (error) {
    console.error('[DATA_DELETION] Error executing deletion:', error)
    return null
  }
}

/**
 * 查找待删除的预约（超过 grace period）
 */
export async function findPendingDeletions() {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    const gracePeriodDate = new Date(
      Date.now() - PRIVACY_CONFIG.DATA_DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
    )

    return await prisma.appointment.findMany({
      where: {
        dataDeleteRequestedAt: {
          lt: gracePeriodDate,
        },
        dataDeletedAt: null,
      },
      select: {
        id: true,
        uuid: true,
        customerEmail: true,
        dataDeleteRequestedAt: true,
      },
    })
  } catch (error) {
    console.error('[DATA_DELETION] Error finding pending deletions:', error)
    return []
  }
}

/**
 * 查找需要保留期限清理的预约（已完成或已取消，超过保留期）
 */
export async function findExpiredRetentionAppointments() {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    const retentionCutoffDate = new Date(
      Date.now() - PRIVACY_CONFIG.BOOKING_RETENTION_DAYS * 24 * 60 * 60 * 1000
    )

    return await prisma.appointment.findMany({
      where: {
        OR: [
          {
            status: 'COMPLETED',
            completedAt: {
              lt: retentionCutoffDate,
            },
          },
          {
            status: 'CANCELLED',
            cancelledAt: {
              lt: retentionCutoffDate,
            },
          },
        ],
        dataDeletedAt: null,
      },
      select: {
        id: true,
        uuid: true,
        status: true,
        completedAt: true,
        cancelledAt: true,
      },
    })
  } catch (error) {
    console.error('[RETENTION] Error finding expired retention:', error)
    return []
  }
}

/**
 * 执行定期数据清理任务
 * 应该在 cron job 中每天运行
 */
export async function runDataMaintenanceTask() {
  console.log('[MAINTENANCE] Starting data maintenance task...')

  const results = {
    requestedDeletionsProcessed: 0,
    retentionExpiredProcessed: 0,
  }

  try {
    // 1. 处理已请求的数据删除（超过 grace period）
    const pendingDeletions = await findPendingDeletions()
    for (const deletion of pendingDeletions) {
      await executeDataDeletion(deletion.id)
      results.requestedDeletionsProcessed++
    }

    // 2. 处理保留期过期的预约
    const expiredRetentions = await findExpiredRetentionAppointments()
    for (const retention of expiredRetentions) {
      await executeDataDeletion(retention.id)
      results.retentionExpiredProcessed++
    }

    console.log('[MAINTENANCE] Task completed:', results)
    return results
  } catch (error) {
    console.error('[MAINTENANCE] Error running maintenance task:', error)
    return results
  }
}

/**
 * 获取客户的个人数据（用于导出/下载）
 */
export async function getCustomerData(appointmentId: number, email: string) {
  if (!process.env.DATABASE_URL) {
    return null
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: {
          select: {
            nameDe: true,
            nameEn: true,
            slug: true,
          },
        },
      },
    })

    if (!appointment) {
      return null
    }

    // 验证邮箱匹配
    if (appointment.customerEmail !== email) {
      return null
    }

    // 返回格式化的个人数据
    return {
      id: appointment.uuid,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      appointmentDate: appointment.appointmentDate.toISOString(),
      appointmentTime: appointment.appointmentTime,
      service: appointment.service,
      locale: appointment.locale,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      privacyConsent: appointment.privacyConsent,
      privacyConsentAt: appointment.privacyConsentAt?.toISOString(),
    }
  } catch (error) {
    console.error('[CUSTOMER_DATA] Error retrieving customer data:', error)
    return null
  }
}
