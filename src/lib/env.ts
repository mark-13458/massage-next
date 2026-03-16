const required = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appUrl: process.env.APP_URL ?? 'http://localhost:3000',
  defaultLocale: process.env.DEFAULT_LOCALE ?? 'de',
  databaseUrl: required(process.env.DATABASE_URL, 'DATABASE_URL'),
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-session-secret',
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },
  adminSeed: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME,
  },
  uploadDir: process.env.UPLOAD_DIR ?? '/app/public/uploads',
  siteName: process.env.BUSINESS_NAME ?? process.env.SITE_NAME ?? 'China TCM Massage',
  adminEmail: process.env.ADMIN_NOTIFY_EMAIL ?? process.env.SMTP_USER ?? '',
  // Admin login Turnstile — independent of the booking-form Turnstile stored in DB.
  // Set TURNSTILE_SECRET_KEY + NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable on the login page.
  adminTurnstile: {
    secretKey: process.env.TURNSTILE_SECRET_KEY ?? '',
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
  },
}
