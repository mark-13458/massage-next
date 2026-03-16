import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailConfiguration, sendBookingConfirmationEmail } from '@/server/services/email.service'

/**
 * GET /api/admin/system/email-config
 * 获取邮件配置状态
 */
export async function GET(request: NextRequest) {
  try {
    const isConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    )

    return NextResponse.json({
      success: true,
      configured: isConfigured,
      config: {
        host: process.env.SMTP_HOST ? '****' : null,
        port: process.env.SMTP_PORT || null,
        from: process.env.SMTP_FROM || 'noreply@massage-next.de',
        business: process.env.BUSINESS_NAME || 'Massage Studio',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/system/email-verify
 * 验证邮件配置与连接
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { success: false, error: 'Test email is required' },
        { status: 400 }
      )
    }

    // 验证 SMTP 配置
    const isValid = await verifyEmailConfiguration()

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP configuration is invalid. Please check your email settings.',
        },
        { status: 500 }
      )
    }

    // 发送测试邮件
    const result = await sendBookingConfirmationEmail({
      uuid: 'test-' + Date.now(),
      customerName: 'Test Customer',
      customerEmail: testEmail,
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      appointmentTime: '10:00',
      service: {
        nameDe: 'Test Service',
        nameEn: 'Test Service',
      },
      locale: 'de',
      rescheduleToken: 'test-reschedule-token',
      cancelToken: 'test-cancel-token',
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully. Please check your inbox.',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send test email',
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[EMAIL_VERIFY] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
