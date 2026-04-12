import { prisma } from '../../../lib/prisma'

export async function findAllKeywords() {
  return prisma.keywordPool.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: { article: { select: { id: true, slug: true, titleDe: true } } },
    take: 500,
  })
}

export async function findNextPendingKeyword(locale?: string) {
  return prisma.keywordPool.findFirst({
    where: {
      status: 'PENDING',
      ...(locale ? { locale } : {}),
    },
    orderBy: { createdAt: 'asc' },
  })
}
