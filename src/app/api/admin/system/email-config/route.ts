import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '../../../../../lib/auth'
import { createMailTransport } from '../../../../../lib/mail'
import { env } from '../../../../../lib/env'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isConfigured = !!(env.smtp.host && env.smtp.port && env.smtp.user && env.smtp.pass)

  return NextResponse.json({
    success: true,
    configured: isConfigured,
    config: {
      host: env.smtp.host ? '****' : null,
      port: env.smtp.port || null,
      from: env.smtp.user || null,
      siteName: env.siteName || null,
    },
  })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { testEmail } = await request.json()
    if (!testEmail || typeof testEmail !== 'string') {
      return NextResponse.json({ success: false, error: 'testEmail is required' }, { status: 400 })
    }

    const transport = createMailTransport()
    if (!transport) {
      return NextResponse.json({ success: false, error: 'SMTP not configured' }, { status: 500 })
    }

    await transport.sendMail({
      from: `"${env.siteName || 'Admin'}" <${env.smtp.user}>`,
      to: testEmail,
      subject: 'Test Email',
      html: '<p>SMTP configuration is working correctly.</p>',
    })

    return NextResponse.json({ success: true, message: 'Test email sent.' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
