import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { TestimonialList } from '../../../components/admin/TestimonialList'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminTestimonials } from '../../../server/services/admin-testimonial.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminTestimonialsPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const lang = await getAdminLang()
  const items = await getAdminTestimonials()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '客户评价', 'Testimonials')}
      subtitle={pick(lang, '管理前台展示的客户评价：新增、编辑、发布/取消发布、删除。', 'Manage customer testimonials shown on the frontend: create, edit, publish and delete.')}
    >
      <AdminPageToolbar>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回后台首页', 'Back to dashboard')}
        </Link>
      </AdminPageToolbar>

      <AdminSectionCard
        eyebrow={pick(lang, '评价管理', 'Testimonial management')}
        title={pick(lang, '客户评价列表', 'Customer testimonials')}
        description={pick(lang, '评价按排序字段升序排列，同排序按创建时间倒序。已发布的评价会在前台对应语言页面展示。', 'Testimonials are sorted by sort order ascending, then by creation date descending. Published ones appear on the frontend in the matching locale.')}
      >
        <TestimonialList
          lang={lang}
          initialItems={items.map((item) => ({
            id: item.id,
            customerName: item.customerName,
            locale: item.locale,
            rating: item.rating,
            content: item.content,
            sortOrder: item.sortOrder,
            isPublished: item.isPublished,
          }))}
        />
      </AdminSectionCard>
    </AdminShell>
  )
}
