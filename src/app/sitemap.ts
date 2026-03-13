import type { MetadataRoute } from 'next'

const baseUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const locales = ['de', 'en']
const routes = ['', '/services', '/booking', '/about', '/contact', '/gallery']

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'weekly' : 'monthly',
      priority: route === '' ? 1 : 0.8,
    })),
  )
}
