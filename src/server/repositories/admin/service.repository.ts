import { prisma } from '../../../lib/prisma'

export async function findAdminServices() {
  return prisma.service.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    take: 100,
  })
}

export async function findAdminServiceById(id: number) {
  return prisma.service.findUnique({ where: { id } })
}
