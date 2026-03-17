import { redirect } from 'next/navigation'
import { getSystemSettings } from '../server/services/site.service'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const settings = await getSystemSettings().catch(() => null)
  redirect(settings?.defaultFrontendLocale === 'en' ? '/en' : '/de')
}
