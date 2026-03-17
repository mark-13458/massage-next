import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { createMailTransport } from '../../../../../lib/mail'
import { env } from '../../../../../lib/env'

export async function POST() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const transport = createMailTransport()
  if (!transport) {
    return NextResponse.json(
      { error: 'SMTP configuration missing or invalid' },
      { status: 400 }
    )
  }

  try {
    const info = await transport.sendMail({
      from: `"Massage System" <${env.smtp.from || env.smtp.user}>`,
      to: admin.email,
      subject: '✅ SMTP Configuration Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2e7d32;">邮件发送服务正常工作</h2>
          <p>您收到这封邮件，说明您的 SMTP 配置已生效。</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">
            系统时间：${new Date().toLocaleString('de-DE')}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ 
      status: 'ok', 
      message: `Test email sent to ${admin.email}`,
      messageId: info.messageId 
    })
  } catch (error) {
    console.error('[admin/settings/test-email] send failed:', error)
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
