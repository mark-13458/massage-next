import nodemailer from 'nodemailer'
import { prisma } from '../../lib/prisma'
import { escapeHtml } from '../../lib/utils'

/**
 * 邮件配置与发送器
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
})

/**
 * 邮件模板类型
 */
export enum EmailTemplate {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_RESCHEDULED = 'booking_rescheduled',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_REMINDER = 'booking_reminder',
  PRIVACY_NOTICE = 'privacy_notice',
}

/**
 * 发送邮件的基础方法
 */
async function sendEmail(options: {
  to: string
  subject: string
  htmlContent: string
  template?: EmailTemplate
  appointmentId?: number
}) {
  if (!process.env.SMTP_HOST) {
    console.warn('[EMAIL] SMTP not configured, skipping email send')
    return { success: false, skipped: true }
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@massage-next.de',
      to: options.to,
      subject: options.subject,
      html: options.htmlContent,
    }

    const result = await transporter.sendMail(mailOptions)

    // 记录邮件发送日志
    if (options.appointmentId) {
      await prisma.emailLog.create({
        data: {
          toEmail: options.to,
          subject: options.subject,
          template: options.template,
          status: 'sent',
          sentAt: new Date(),
        },
      })
    }

    console.log(`[EMAIL] Sent ${options.template || 'email'} to ${options.to}`)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error)

    // 记录失败日志
    if (options.appointmentId) {
      await prisma.emailLog.create({
        data: {
          toEmail: options.to,
          subject: options.subject,
          template: options.template,
          status: 'failed',
          error: String(error),
        },
      })
    }

    return { success: false, error: String(error) }
  }
}

/**
 * 发送预约确认邮件
 */
export async function sendBookingConfirmationEmail(appointment: {
  uuid: string
  customerName: string
  customerEmail: string | null
  appointmentDate: Date
  appointmentTime: string
  service: { nameDe?: string; nameEn?: string }
  locale: string
  confirmationToken?: string | null
  rescheduleToken?: string
  cancelToken?: string
}) {
  if (!appointment.customerEmail) {
    console.warn('[EMAIL] No customer email, skipping booking confirmation')
    return
  }

  const isGerman = appointment.locale === 'de'
  const serviceName = isGerman ? appointment.service.nameDe : appointment.service.nameEn

  const formattedDate = appointment.appointmentDate.toLocaleDateString(
    isGerman ? 'de-DE' : 'en-GB'
  )
  const rescheduleUrl = appointment.rescheduleToken
    ? `${process.env.APP_URL}/appointment/reschedule/${appointment.rescheduleToken}`
    : ''
  const cancelUrl = appointment.cancelToken
    ? `${process.env.APP_URL}/appointment/cancel/${appointment.cancelToken}`
    : ''

  const subject = isGerman
    ? 'Ihre Terminbestätigung / Your appointment confirmation'
    : 'Your appointment confirmation'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 10px 10px 10px 0; }
          .button.secondary { background: #999; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isGerman ? 'Vielen Dank für Ihre Buchung!' : 'Thank you for your booking!'}</h1>
            <p>${isGerman ? 'Ihre Terminbestätigung ist unten aufgelistet.' : 'Your appointment details are listed below.'}</p>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>${isGerman ? 'Leistung:' : 'Service:'}</strong> ${escapeHtml(serviceName)}</p>
            <p><strong>${isGerman ? 'Datum:' : 'Date:'}</strong> ${formattedDate}</p>
            <p><strong>${isGerman ? 'Uhrzeit:' : 'Time:'}</strong> ${escapeHtml(appointment.appointmentTime)}</p>
            <p><strong>${isGerman ? 'Name:' : 'Name:'}</strong> ${escapeHtml(appointment.customerName)}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p>${isGerman ? 'Ihre Termin-Links:' : 'Your appointment links:'}</p>
            ${
              rescheduleUrl
                ? `<a href="${rescheduleUrl}" class="button">${isGerman ? 'Termin ändern' : 'Reschedule'}</a>`
                : ''
            }
            ${
              cancelUrl
                ? `<a href="${cancelUrl}" class="button secondary">${isGerman ? 'Termin absagen' : 'Cancel'}</a>`
                : ''
            }
          </div>

          <div class="footer">
            <p>${isGerman ? 'Mit freundlichen Grüßen,' : 'Best regards,'}</p>
            <p>${process.env.BUSINESS_NAME || 'Massage Studio'}</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: appointment.customerEmail,
    subject,
    htmlContent,
    template: EmailTemplate.BOOKING_CONFIRMATION,
  })
}

/**
 * 发送改约通知邮件
 */
export async function sendRescheduleNotificationEmail(appointment: {
  customerName: string
  customerEmail: string | null
  appointmentDate: Date
  appointmentTime: string
  service: { nameDe?: string; nameEn?: string }
  locale: string
  oldDate: Date
  oldTime: string
  rescheduleToken?: string
}) {
  if (!appointment.customerEmail) {
    return
  }

  const isGerman = appointment.locale === 'de'
  const serviceName = isGerman ? appointment.service.nameDe : appointment.service.nameEn

  const formattedNewDate = appointment.appointmentDate.toLocaleDateString(
    isGerman ? 'de-DE' : 'en-GB'
  )
  const formattedOldDate = appointment.oldDate.toLocaleDateString(
    isGerman ? 'de-DE' : 'en-GB'
  )

  const subject = isGerman
    ? 'Ihr Termin wurde verschoben'
    : 'Your appointment has been rescheduled'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isGerman ? 'Ihr Termin wurde verschoben' : 'Your appointment has been rescheduled'}</h1>
          </div>

          <p>${isGerman ? 'Alter Termin:' : 'Old appointment:'} ${formattedOldDate} ${escapeHtml(appointment.oldTime)}</p>
          <p>${isGerman ? 'Neuer Termin:' : 'New appointment:'} ${formattedNewDate} ${escapeHtml(appointment.appointmentTime)}</p>
          <p>${isGerman ? 'Leistung:' : 'Service:'} ${escapeHtml(serviceName)}</p>

          <p style="margin-top: 30px;">
            ${
              appointment.rescheduleToken
                ? `<a href="${process.env.APP_URL}/appointment/reschedule/${appointment.rescheduleToken}" class="button">${isGerman ? 'Details anzeigen' : 'View details'}</a>`
                : ''
            }
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: appointment.customerEmail,
    subject,
    htmlContent,
    template: EmailTemplate.BOOKING_RESCHEDULED,
  })
}

/**
 * 发送取消通知邮件
 */
export async function sendCancellationNotificationEmail(appointment: {
  customerName: string
  customerEmail: string | null
  appointmentDate: Date
  appointmentTime: string
  service: { nameDe?: string; nameEn?: string }
  locale: string
  reason?: string
}) {
  if (!appointment.customerEmail) {
    return
  }

  const isGerman = appointment.locale === 'de'
  const serviceName = isGerman ? appointment.service.nameDe : appointment.service.nameEn
  const formattedDate = appointment.appointmentDate.toLocaleDateString(
    isGerman ? 'de-DE' : 'en-GB'
  )

  const subject = isGerman ? 'Ihr Termin wurde abgesagt' : 'Your appointment has been cancelled'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isGerman ? 'Ihr Termin wurde abgesagt' : 'Your appointment has been cancelled'}</h1>
          </div>

          <p>${isGerman ? 'Termin:' : 'Appointment:'} ${formattedDate} ${escapeHtml(appointment.appointmentTime)}</p>
          <p>${isGerman ? 'Leistung:' : 'Service:'} ${escapeHtml(serviceName)}</p>

          ${appointment.reason ? `<p>${isGerman ? 'Grund:' : 'Reason:'} ${escapeHtml(appointment.reason)}</p>` : ''}

          <p style="margin-top: 30px; color: #666;">
            ${isGerman ? 'Kontaktieren Sie uns für einen neuen Termin.' : 'Please contact us to book a new appointment.'}
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: appointment.customerEmail,
    subject,
    htmlContent,
    template: EmailTemplate.BOOKING_CANCELLED,
  })
}

/**
 * 发送隐私通知邮件
 */
export async function sendPrivacyNoticeEmail(email: string, locale: string = 'de') {
  const isGerman = locale === 'de'
  const subject = isGerman
    ? 'Datenschutzhinweis / Privacy Notice'
    : 'Privacy Notice'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>${isGerman ? 'Datenschutzhinweis' : 'Privacy Notice'}</h1>
        
        <p>${isGerman ? 'Ihre persönlichen Daten werden gemäß GDPR geschützt.' : 'Your personal data is protected according to GDPR.'}</p>
        
        <p>
          <a href="${process.env.APP_URL}/datenschutz">${isGerman ? 'Datenschutzerklärung lesen' : 'Read Privacy Policy'}</a>
        </p>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject,
    htmlContent,
    template: EmailTemplate.PRIVACY_NOTICE,
  })
}

/**
 * 验证邮件配置
 */
export async function verifyEmailConfiguration() {
  try {
    await transporter.verify()
    console.log('[EMAIL] SMTP configuration verified successfully')
    return true
  } catch (error) {
    console.error('[EMAIL] SMTP configuration error:', error)
    return false
  }
}
