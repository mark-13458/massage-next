import { NextRequest, NextResponse } from 'next/server'
import { validateCancelToken, cancelAppointmentByToken } from '@/server/services/appointment-reschedule.service'
import { sendCancellationNotificationEmail } from '@/server/services/email.service'
import { headers } from 'next/headers'

/**
 * GET /api/appointment/cancel/[token]
 * 验证取消 token 并返回预约详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token

  try {
    const appointment = await validateCancelToken(token)

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired cancel link' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: appointment.id,
        uuid: appointment.uuid,
        customerName: appointment.customerName,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        locale: appointment.locale,
      },
    })
  } catch (error) {
    console.error('[CANCEL_API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointment/cancel/[token]
 * 执行取消操作
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token

  try {
    const body = await request.json()
    const { reason } = body

    // 获取请求上下文
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || undefined

    // 执行取消
    const cancelled = await cancelAppointmentByToken(
      token,
      reason,
      { ipAddress, userAgent }
    )

    // 发送通知邮件
    if (cancelled.customerEmail) {
      await sendCancellationNotificationEmail({
        customerName: cancelled.customerName,
        customerEmail: cancelled.customerEmail,
        appointmentDate: cancelled.appointmentDate,
        appointmentTime: cancelled.appointmentTime,
        service: cancelled.service,
        locale: cancelled.locale,
        reason: reason || undefined,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    })
  } catch (error: any) {
    console.error('[CANCEL_API] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
