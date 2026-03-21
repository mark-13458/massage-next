import nodemailer from 'nodemailer'
import { env } from './env'

interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
}

/** Resolve SMTP config: DB settings take priority over env vars */
export async function resolveSmtpConfig(): Promise<SmtpConfig | null> {
  // Try DB settings first
  try {
    const { prisma } = await import('./prisma')
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'adminSystemSettings' } })
    const v = setting?.value as Record<string, unknown> | null | undefined
    if (v && typeof v.smtpHost === 'string' && v.smtpHost &&
        typeof v.smtpUser === 'string' && v.smtpUser &&
        typeof v.smtpPass === 'string' && v.smtpPass) {
      return {
        host: v.smtpHost,
        port: typeof v.smtpPort === 'number' ? v.smtpPort : 587,
        secure: Boolean(v.smtpSecure),
        user: v.smtpUser,
        pass: v.smtpPass,
        from: typeof v.smtpFrom === 'string' && v.smtpFrom ? v.smtpFrom : v.smtpUser,
      }
    }
  } catch {
    // DB unavailable — fall through to env
  }

  // Fall back to env vars
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null
  return {
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    user: env.smtp.user,
    pass: env.smtp.pass,
    from: env.smtp.from || env.smtp.user,
  }
}

export function createMailTransport() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    return null
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  })
}

export async function createMailTransportAsync() {
  const config = await resolveSmtpConfig()
  if (!config) return null

  return {
    transport: nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    }),
    from: config.from,
  }
}
