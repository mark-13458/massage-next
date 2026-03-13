import { prisma } from '../../../lib/prisma'

const SETTINGS_KEY = 'adminSystemSettings'

export async function findAdminSystemSetting() {
  return prisma.siteSetting.findUnique({
    where: { key: SETTINGS_KEY },
  })
}
