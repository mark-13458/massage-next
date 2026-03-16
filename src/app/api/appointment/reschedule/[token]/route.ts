import { NextRequest, NextResponse } from 'next/server'
import { validateRescheduleToken, rescheduleAppointmentByToken } from '@/server/services/appointment-reschedule.service'
import { sendRescheduleNotificationEmail } from '@/server/services/email.service'
import { headers } from 'next/headers'

/**
 * GET /api/appointment/reschedule/[token]
 * 验证改约 token 并返回预约详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const appointment = await validateRescheduleToken(token)

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reschedule link' },
        { status: 404 }
      )
    }

    // 返回预约详情（不包含敏感信息）
    return NextResponse.json({
      success: true,
      data: {
        id: appointment.id,
        uuid: appointment.uuid,
        customerName: appointment.customerName,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        locale: appointment.locale,
        durationMin: appointment.durationMin,
      },
    })
  } catch (error) {
    console.error('[RESCHEDULE_API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointment/reschedule/[token]
 * 执行改约操作
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const body = await request.json()
    const { newDate, newTime } = body

    if (!newDate || !newTime) {
      return NextResponse.json(
        { success: false, error: 'Missing newDate or newTime' },
        { status: 400 }
      )
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const timeRegex = /^\d{1,2}:\d{2}$/
    if (!dateRegex.test(newDate) || !timeRegex.test(newTime)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date or time format' },
        { status: 400 }
      )
    }
    const parsedDate = new Date(newDate)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date' },
        { status: 400 }
      )
    }

    // 获取请求上下文
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || undefined

    // 先获取旧日期/时间，再执行改约
    const existing = await validateRescheduleToken(token)
    const oldDate = existing?.appointmentDate ?? new Date(newDate)
    const oldTime = existing?.appointmentTime ?? newTime

    // 执行改约
    const updated = await rescheduleAppointmentByToken(
      token,
      parsedDate,
      newTime,
      { ipAddress, userAgent }
    )

    // 发送通知邮件
    if (updated.customerEmail) {
      await sendRescheduleNotificationEmail({
        customerName: updated.customerName,
        customerEmail: updated.customerEmail,
        appointmentDate: updated.appointmentDate,
        appointmentTime: newTime,
        service: updated.service,
        locale: updated.locale,
        oldDate,
        oldTime,
        rescheduleToken: undefined,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
    })
  } catch (error) {
    console.error('[RESCHEDULE_API] Error:', error)
    const msg = error instanceof Error ? error.message : ''
    const isKnown = msg === 'Invalid or expired reschedule link'
    return NextResponse.json(
      { success: false, error: isKnown ? msg : 'Internal server error' },
      { status: isKnown ? 400 : 500 }
    )
  }
}
