import { findAdminSystemSetting } from '../repositories/admin/settings.repository'
import { toAdminSettingsViewModel } from '../view-models/admin/settings.vm'

export async function getAdminSystemSettings() {
  if (!process.env.DATABASE_URL) return null

  try {
    const setting = await findAdminSystemSetting()
    return toAdminSettingsViewModel(setting?.value ?? null)
  } catch {
    return null
  }
}
