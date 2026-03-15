import { Appointment, Service } from '@prisma/client'
import { createMailTransport } from '../../lib/mail'
import { env } from '../../lib/env'

type BookingWithService = Appointment & {
  service: Service
}

// 简单的多语言映射辅助函数
function t(locale: string, de: string, en: string) {
  return locale === 'en' ? en : de
}

function getManageLink(token: string | null, locale: string) {
  if (!token) return null
  return `${env.appUrl}/${locale}/booking/manage/${token}`
}

function getFormattedDate(date: Date, locale: string) {
  return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// 通用邮件发送器
async function sendEmail(to: string, subject: string, html: string) {
  const transport = createMailTransport()
  
  if (!transport) {
    console.warn('⚠️ SMTP not configured, skipping email send')
    return false
  }

  try {
    await transport.sendMail({
      from: `"${env.siteName || 'Massage Service'}" <${env.smtp.user}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error)
    return false
  }
}

// 商家通知：收到新预约
export async function sendMerchantBookingNotification(booking: BookingWithService) {
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

  const success = await sendEmail(env.adminEmail || env.smtp.user, subject, html)
  if (success) {
    console.log(`📧 Merchant notification sent for booking ${booking.uuid}`)
  }
  return success
}

// 客户通知：收到预约请求（Pending）
export async function sendCustomerReceivedEmail(booking: BookingWithService) {
  if (!booking.customerEmail) return false

  const locale = booking.locale || 'de'
  const dateStr = getFormattedDate(booking.appointmentDate, locale)
  const manageLink = getManageLink(booking.confirmationToken, locale)
  const siteName = env.siteName || 'Massage Service'

  const subject = t(locale,
    `Eingang Ihrer Buchungsanfrage - ${siteName}`,
    `Booking Request Received - ${siteName}`
  )

  const title = t(locale, 'Vielen Dank für Ihre Anfrage', 'Thank you for your request')
  const intro = t(locale,
    `Wir haben Ihre Buchungsanfrage erhalten. Wir werden diese schnellstmöglich prüfen und bestätigen.`,
    `We have received your booking request. We will review and confirm it as soon as possible.`
  )
  
  const detailsTitle = t(locale, 'Ihre Anfrage', 'Your Request')
  const serviceLabel = t(locale, 'Service', 'Service')
  const dateLabel = t(locale, 'Datum', 'Date')
  const timeLabel = t(locale, 'Uhrzeit', 'Time')
  const durationLabel = t(locale, 'Dauer', 'Duration')
  const priceLabel = t(locale, 'Preis ca.', 'Price approx.')
  const manageLabel = t(locale, 'Buchung verwalten', 'Manage Booking')

  const serviceName = locale === 'en' ? booking.service.nameEn : booking.service.nameDe

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #d97706;">${title}</h2>
      <p>${intro}</p>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">${detailsTitle}</h3>
        <p><strong>${serviceLabel}:</strong> ${serviceName}</p>
        <p><strong>${dateLabel}:</strong> ${dateStr}</p>
        <p><strong>${timeLabel}:</strong> ${booking.appointmentTime}</p>
        <p><strong>${durationLabel}:</strong> ${booking.durationMin} min</p>
        <p><strong>${priceLabel}:</strong> €${booking.priceSnapshot}</p>
      </div>

      ${manageLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${manageLink}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: bold;">${manageLabel}</a>
        </div>
      ` : ''}

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${siteName}
      </p>
    </div>
  `

  const success = await sendEmail(booking.customerEmail, subject, html)
  if (success) {
    console.log(`📧 Customer received email sent for booking ${booking.uuid}`)
  }
  return success
}

// 客户通知：预约已确认（Confirmed）
export async function sendCustomerConfirmationEmail(booking: BookingWithService) {
  if (!booking.customerEmail) return false

  const locale = booking.locale || 'de'
  const dateStr = getFormattedDate(booking.appointmentDate, locale)
  const manageLink = getManageLink(booking.confirmationToken, locale)
  const siteName = env.siteName || 'Massage Service'

  const subject = t(locale,
    `Buchungsbestätigung - ${siteName}`,
    `Booking Confirmation - ${siteName}`
  )

  const title = t(locale, 'Buchung bestätigt', 'Booking Confirmed')
  const intro = t(locale,
    `Ihre Buchung wurde bestätigt. Wir freuen uns auf Ihren Besuch!`,
    `Your booking has been confirmed. We look forward to your visit!`
  )

  const detailsTitle = t(locale, 'Buchungsdetails', 'Booking Details')
  const serviceLabel = t(locale, 'Service', 'Service')
  const dateLabel = t(locale, 'Datum', 'Date')
  const timeLabel = t(locale, 'Uhrzeit', 'Time')
  const locationLabel = t(locale, 'Ort', 'Location')
  const manageLabel = t(locale, 'Buchung bearbeiten / stornieren', 'Edit / Cancel Booking')

  const serviceName = locale === 'en' ? booking.service.nameEn : booking.service.nameDe

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #16a34a;">${title}</h2>
      <p>${intro}</p>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0; background-color: #f0fdf4;">
        <h3 style="margin-top: 0; border-bottom: 1px solid #dcfce7; padding-bottom: 10px; color: #166534;">${detailsTitle}</h3>
        <p><strong>${serviceLabel}:</strong> ${serviceName}</p>
        <p><strong>${dateLabel}:</strong> ${dateStr}</p>
        <p><strong>${timeLabel}:</strong> ${booking.appointmentTime}</p>
      </div>

      ${manageLink ? `
        <p style="margin-top: 20px;">
          ${t(locale, 'Falls Sie den Termin ändern oder stornieren müssen:', 'If you need to change or cancel your appointment:')}
        </p>
        <div style="margin: 20px 0;">
          <a href="${manageLink}" style="color: #4b5563; text-decoration: underline;">${manageLabel}</a>
        </div>
      ` : ''}

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${siteName}
      </p>
    </div>
  `

  const success = await sendEmail(booking.customerEmail, subject, html)
  if (success) {
    console.log(`📧 Customer confirmation email sent for booking ${booking.uuid}`)
  }
  return success
}

// 客户通知：预约已取消（Cancelled）
export async function sendCustomerCancelledEmail(booking: BookingWithService) {
  if (!booking.customerEmail) return false

  const locale = booking.locale || 'de'
  const dateStr = getFormattedDate(booking.appointmentDate, locale)
  const siteName = env.siteName || 'Massage Service'

  const subject = t(locale,
    `Buchung storniert - ${siteName}`,
    `Booking Cancelled - ${siteName}`
  )

  const title = t(locale, 'Buchung storniert', 'Booking Cancelled')
  const intro = t(locale,
    `Ihre Buchung wurde storniert.`,
    `Your booking has been cancelled.`
  )

  const detailsTitle = t(locale, 'Stornierter Termin', 'Cancelled Appointment')
  const serviceLabel = t(locale, 'Service', 'Service')
  const dateLabel = t(locale, 'Datum', 'Date')
  const timeLabel = t(locale, 'Uhrzeit', 'Time')

  const serviceName = locale === 'en' ? booking.service.nameEn : booking.service.nameDe

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #dc2626;">${title}</h2>
      <p>${intro}</p>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0; background-color: #fef2f2;">
        <h3 style="margin-top: 0; border-bottom: 1px solid #fee2e2; padding-bottom: 10px; color: #991b1b;">${detailsTitle}</h3>
        <p><strong>${serviceLabel}:</strong> ${serviceName}</p>
        <p><strong>${dateLabel}:</strong> ${dateStr}</p>
        <p><strong>${timeLabel}:</strong> ${booking.appointmentTime}</p>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ${siteName}
      </p>
    </div>
  `

  const success = await sendEmail(booking.customerEmail, subject, html)
  if (success) {
    console.log(`📧 Customer cancellation email sent for booking ${booking.uuid}`)
  }
  return success
}
