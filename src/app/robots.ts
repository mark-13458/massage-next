import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

async function getBaseUrl() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || 'https'
  const envUrl = process.env.APP_URL
  if (envUrl && envUrl !== 'http://localhost' && envUrl !== 'http://localhost:3000') {
    return envUrl.replace(/\/$/, '')
  }
  return `${proto}://${host}`.replace(/\/$/, '')
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const appUrl = await getBaseUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/*/booking/confirm'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}
