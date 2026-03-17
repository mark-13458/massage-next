import { NextResponse } from 'next/server'
import { getSystemSettings } from '../../../../../server/services/site.service'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { runDataMaintenanceTask } from '../../../../../server/services/privacy.service'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getSystemSettings().catch(() => null)
    const retentionDays = settings?.bookingRetentionDays ?? 180

    // 计算截止日期
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    // 使用 privacy service 执行清理，确保审计日志和 GDPR 合规
    const maintenanceResult = await runDataMaintenanceTask()

    // 额外：硬删除已匿名化且超过保留期的记录（dataDeletedAt 已设置）
    const hardDeleteResult = await prisma.appointment.deleteMany({
      where: {
        dataDeletedAt: { not: null },
        appointmentDate: { lt: cutoffDate },
      },
    })

    return NextResponse.json({
      status: 'ok',
      retentionDays,
      cutoffDate: cutoffDate.toISOString(),
      anonymized: maintenanceResult.requestedDeletionsProcessed + maintenanceResult.retentionExpiredProcessed,
      hardDeleted: hardDeleteResult.count,
    })
  } catch (error) {
    console.error('[admin/system/cleanup] unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
