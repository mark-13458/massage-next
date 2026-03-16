import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { getSystemSettings } from '../../../../../server/services/site.service'
import { createAuditLog } from '../../../../../server/services/audit.service'
import { headers } from 'next/headers'

/**
 * GET /api/booking/manage/[token]
 * 通过 confirmationToken 获取预约信息（客户侧）
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const settings = await getSystemSettings().catch(() => null)
  if (settings?.featureEnableBookingManage === false) {
    return NextResponse.json({ error: 'Booking management is disabled' }, { status: 403 })
  }

  const appointment = await prisma.appointment.findFirst({
    where: { confirmationToken: token },
    include: { service: true },
  })

  if (!appointment) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      item: {
        customerName: appointment.customerName,
        serviceName: appointment.service.nameDe,
        appointmentDate: appointment.appointmentDate.toISOString(),
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
      },
    },
  })
}

/**
 * PATCH /api/booking/manage/[token]
 * 客户通过 token 改约或取消
 * body: { action: 'cancel' | 'reschedule', appointmentDate?, appointmentTime?, notes? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const settings = await getSystemSettings().catch(() => null)
  if (settings?.featureEnableBookingManage === false) {
    return NextResponse.json({ error: 'Booking management is disabled' }, { status: 403 })
  }

  const appointment = await prisma.appointment.findFirst({
    where: { confirmationToken: token },
    include: { service: true },
  })

  if (!appointment) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
    return NextResponse.json({ error: 'Booking cannot be modified' }, { status: 400 })
  }

  const body = await request.json()
  const { action, appointmentDate, appointmentTime, notes } = body

  const headersList = await headers()
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

  if (action === 'cancel') {
    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        internalNote: notes ? `[客户取消] ${notes}` : '[客户通过链接取消]',
      },
      include: { service: true },
    })

    await createAuditLog({
      action: 'BOOKING_CANCELLED',
      entityType: 'APPOINTMENT',
      entityId: appointment.id,
      ipAddress,
      oldValue: { status: appointment.status },
      newValue: { status: 'CANCELLED' },
      additionalInfo: { method: 'CUSTOMER_TOKEN', notes },
    })

    // 异步发送取消通知邮件
    if (appointment.customerEmail) {
      import('../../../../../server/services/mail.service').then(({ sendCustomerCancelledEmail }) => {
        sendCustomerCancelledEmail(updated as any).catch(err =>
          console.error('Failed to send customer cancellation email:', err)
        )
      })
    }

    return NextResponse.json({
      data: { item: { status: updated.status, appointmentDate: updated.appointmentDate, appointmentTime: updated.appointmentTime } },
    })
  }

  if (action === 'reschedule') {
    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: 'Missing appointmentDate or appointmentTime' }, { status: 400 })
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        status: 'PENDING',
        confirmedAt: null,
        internalNote: notes ? `[客户改约] ${notes}` : '[客户通过链接改约]',
      },
      include: { service: true },
    })

    await createAuditLog({
      action: 'BOOKING_RESCHEDULED',
      entityType: 'APPOINTMENT',
      entityId: appointment.id,
      ipAddress,
      oldValue: { date: appointment.appointmentDate, time: appointment.appointmentTime },
      newValue: { date: appointmentDate, time: appointmentTime },
      additionalInfo: { method: 'CUSTOMER_TOKEN', notes },
    })

    // 异步发送改约通知邮件（商家）
    import('../../../../../server/services/mail.service').then(({ sendMerchantBookingNotification }) => {
      sendMerchantBookingNotification(updated as any).catch(err =>
        console.error('Failed to send merchant reschedule notification:', err)
      )
    })

    return NextResponse.json({
      data: { item: { status: updated.status, appointmentDate: updated.appointmentDate, appointmentTime: updated.appointmentTime } },
    })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
