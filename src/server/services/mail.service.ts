import { Appointment, Service } from '@prisma/client'
import { createMailTransport } from '../../lib/mail'
import { env } from '../../lib/env'

type BookingWithService = Appointment & {
  service: Service
}

export async function sendMerchantBookingNotification(booking: BookingWithService) {
  const transport = createMailTransport()
  
  if (!transport) {
    console.warn('⚠️ SMTP not configured, skipping merchant notification email')
    return false
  }

  const dateStr = booking.appointmentDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  
  const timeStr = booking.appointmentTime
  const subject = `[新预约] ${booking.customerName} - ${dateStr} ${timeStr}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2e7d32;">收到新的预约请求</h2>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>客户姓名：</strong> ${booking.customerName}</p>
        <p><strong>联系电话：</strong> <a href="tel:${booking.customerPhone}">${booking.customerPhone}</a></p>
        <p><strong>电子邮箱：</strong> ${booking.customerEmail || '未提供'}</p>
      </div>

      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">预约详情</h3>
        <p><strong>服务项目：</strong> ${booking.service.nameZh} / ${booking.service.nameEn}</p>
        <p><strong>预约日期：</strong> ${dateStr}</p>
        <p><strong>预约时间：</strong> ${timeStr}</p>
        <p><strong>服务时长：</strong> ${booking.durationMin} 分钟</p>
        <p><strong>预计价格：</strong> €${booking.priceSnapshot}</p>
        ${booking.notes ? `<p><strong>客户备注：</strong> ${booking.notes}</p>` : ''}
      </div>

      <p style="color: #666; font-size: 14px;">
        * 请登录后台 <a href="${env.appUrl}/admin/appointments/${booking.id}">查看详情并处理</a>
      </p>
    </div>
  `

  try {
    await transport.sendMail({
      from: `"Massage Booking" <${env.smtp.user}>`,
      to: env.adminEmail || env.smtp.user, // 优先发给配置的管理员邮箱，否则发给发件人自己
      subject,
      html,
    })
    console.log(`📧 Notification email sent for booking ${booking.uuid}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send merchant notification email:', error)
    return false
  }
}
