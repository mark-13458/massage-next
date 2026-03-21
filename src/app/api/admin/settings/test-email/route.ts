import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { createMailTransportAsync } from '../../../../../lib/mail'

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { to?: string }
  const to = typeof body.to === 'string' && body.to.trim() ? body.to.trim() : admin.email

  const result = await createMailTransportAsync()
  if (!result) {
    return NextResponse.json(
      { error: 'SMTP configuration missing. Please configure SMTP settings first.' },
      { status: 400 }
    )
  }

  try {
    const info = await result.transport.sendMail({
      from: `"Massage System" <${result.from}>`,
      to,
      subject: '✅ SMTP Configuration Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2e7d32;">邮件发送服务正常工作</h2>
          <p>您收到这封邮件，说明您的 SMTP 配置已生效。</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">
            收件地址：${to}<br/>
            系统时间：${new Date().toLocaleString('de-DE')}
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      status: 'ok',
      message: `测试邮件已发送至 ${to}`,
      messageId: info.messageId,
    })
  } catch (error) {
    console.error('[admin/settings/test-email] send failed:', error)
    return NextResponse.json(
      { error: 'Failed to send test email. Please check your SMTP settings.' },
      { status: 500 }
    )
  }
}
