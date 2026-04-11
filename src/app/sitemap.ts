import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { prisma } from '../lib/prisma'

const locales = ['de', 'en']
// 法律页面（impressum/privacy）设置了 noindex，不收录进 sitemap
// booking 页设置了 noindex（表单页），不收录
const staticRoutes = ['', '/services', '/about', '/contact', '/gallery']

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseUrl()

  function buildAlternates(route: string) {
    return {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])
      ) as Record<string, string>,
    }
  }

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1 : route === '/services' ? 0.9 : 0.8,
      alternates: buildAlternates(route),
    })),
  )

  let serviceEntries: MetadataRoute.Sitemap = []
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
    serviceEntries = locales.flatMap((locale) =>
      services.map((s) => ({
        url: `${baseUrl}/${locale}/services/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.85,
        alternates: buildAlternates(`/services/${s.slug}`),
      })),
    )
  } catch {
    // 数据库不可用时跳过
  }

  return [...staticEntries, ...serviceEntries]
}
