import { redirect } from 'next/navigation'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { AdminPageToolbar } from '../../../../components/admin/AdminPageToolbar'
import { AdminSectionCard } from '../../../../components/admin/AdminSectionCard'
import { BlacklistManager } from '../../../../components/admin/BlacklistManager'
import { getCurrentAdmin } from '../../../../lib/auth'
import { getAdminLang, pick } from '../../../../lib/admin-i18n'
import { getBlacklist } from '../../../../server/services/booking-protection.service'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BlacklistPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; value?: string }>
}) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const { type, value } = await searchParams
  const items = await getBlacklist()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '预约黑名单', 'Booking blacklist')}
      subtitle={pick(lang, '封禁指定电话、邮箱或 IP，阻止恶意预约。', 'Block specific phones, emails or IPs from making bookings.')}
    >
      <AdminPageToolbar>
        <Link
          href="/admin/settings"
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
        >
          {pick(lang, '返回设置', 'Back to settings')}
        </Link>
      </AdminPageToolbar>

      <AdminSectionCard title={pick(lang, '封禁管理', 'Block management')}>
        <BlacklistManager
          lang={lang}
          initial={items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }))}
          prefillType={type}
          prefillValue={value}
        />
      </AdminSectionCard>
    </AdminShell>
  )
}
