import type { MetadataRoute } from 'next'
import { prisma } from '../lib/prisma'

const baseUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const locales = ['de', 'en']
const staticRoutes = ['', '/services', '/booking', '/about', '/contact', '/gallery', '/impressum', '/privacy']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1 : route === '/services' ? 0.9 : 0.8,
    })),
  )

  // 服务详情页（动态）
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
      })),
    )
  } catch {
    // 数据库不可用时跳过
  }

  return [...staticEntries, ...serviceEntries]
}
