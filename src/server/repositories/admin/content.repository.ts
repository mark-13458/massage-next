import { prisma } from '../../../lib/prisma'

export async function getHeroSettingRecord() {
  return prisma.siteSetting.findUnique({ where: { key: 'hero' } })
}

export async function getFaqItems() {
  return prisma.faqItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
}
