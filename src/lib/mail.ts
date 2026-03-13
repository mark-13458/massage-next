import nodemailer from 'nodemailer'
import { env } from './env'

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
