import { prisma } from '../../../lib/prisma'

export async function findAdminArticles() {
  return prisma.article.findMany({
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      coverImage: { select: { filePath: true } },
      tags: { include: { tag: true } },
      keyword: { select: { keyword: true } },
    },
    take: 200,
  })
}

export async function findAdminArticleById(id: number) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      coverImage: { select: { filePath: true } },
      tags: { include: { tag: true } },
      keyword: { select: { id: true, keyword: true } },
    },
  })
}
