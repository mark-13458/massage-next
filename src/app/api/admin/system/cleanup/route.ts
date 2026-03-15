import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getSystemSettings } from '../../../../../server/services/site.service'
import { getSession } from '../../../../../lib/auth'

export async function POST(request: Request) {
  try {
    // Basic auth check: require admin session
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getSystemSettings()
    const retentionDays = settings.bookingRetentionDays || 180
    
    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    const result = await prisma.appointment.deleteMany({
      where: {
        appointmentDate: {
          lt: cutoffDate,
        },
      },
    })

    return NextResponse.json({
      status: 'ok',
      deletedCount: result.count,
      retentionDays,
      cutoffDate: cutoffDate.toISOString(),
    })
  } catch (error) {
    console.error('Cleanup failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
