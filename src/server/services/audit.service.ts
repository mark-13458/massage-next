import { prisma } from '../../lib/prisma'

export interface AuditLogInput {
  action: string
  entityType: string
  entityId?: number | null
  changedBy?: number | null
  oldValue?: any
  newValue?: any
  ipAddress?: string
  userAgent?: string
  additionalInfo?: any
}

/**
 * 记录操作日志
 * 支持所有关键业务事件：预约、登录、内容变更等
 */
export async function createAuditLog(input: AuditLogInput) {
  if (!process.env.DATABASE_URL) {
    console.warn('[AUDIT] Database not configured, skipping audit log', input)
    return null
  }

  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changedBy: input.changedBy,
        oldValue: input.oldValue,
        newValue: input.newValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        additionalInfo: input.additionalInfo,
      },
    })
  } catch (error) {
    console.error('[AUDIT] Error creating audit log:', error, input)
    return null
  }
}

/**
 * 获取操作日志列表
 */
export async function getAuditLogs(
  filter?: {
    action?: string
    entityType?: string
    entityId?: number
    limit?: number
    offset?: number
  }
) {
  if (!process.env.DATABASE_URL) {
    return []
  }

  try {
    const limit = filter?.limit || 100
    const offset = filter?.offset || 0

    return await prisma.auditLog.findMany({
      where: {
        ...(filter?.action && { action: filter.action }),
        ...(filter?.entityType && { entityType: filter.entityType }),
        ...(filter?.entityId && { entityId: filter.entityId }),
      },
      include: {
        changedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })
  } catch (error) {
    console.error('[AUDIT] Error fetching audit logs:', error)
    return []
  }
}

/**
 * 记录预约操作
 */
export async function logBookingAction(
  action: string,
  appointmentId: number,
  data: {
    changedBy?: number
    oldStatus?: string
    newStatus?: string
    internalNote?: string
    ipAddress?: string
    userAgent?: string
  }
) {
  return createAuditLog({
    action: `BOOKING_${action}`,
    entityType: 'APPOINTMENT',
    entityId: appointmentId,
    changedBy: data.changedBy,
    oldValue: data.oldStatus
      ? {
          status: data.oldStatus,
        }
      : undefined,
    newValue:
      data.newStatus || data.internalNote
        ? {
            status: data.newStatus,
            internalNote: data.internalNote,
          }
        : undefined,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  })
}
