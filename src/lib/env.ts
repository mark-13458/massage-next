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
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },
  adminSeed: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME,
  },
  uploadDir: process.env.UPLOAD_DIR ?? '/app/uploads',
}
