import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { AdminWorkspaceLayout } from '../../../components/admin/AdminWorkspaceLayout'
import { AdminStatGrid } from '../../../components/admin/AdminStatGrid'
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

  const published = items.filter((i) => i.isPublished).length
  const unpublished = items.length - published
  const deCount = items.filter((i) => i.locale === 'de').length
  const enCount = items.filter((i) => i.locale === 'en').length
  const avgRating =
    items.length > 0
      ? (items.reduce((sum, i) => sum + (i.rating || 0), 0) / items.length).toFixed(1)
      : '—'

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '客户评价', 'Testimonials')}
      subtitle={pick(lang, '管理前台展示的客户评价：新增、编辑、发布/取消发布、删除。', 'Manage customer testimonials shown on the frontend: create, edit, publish and delete.')}
    >
      <AdminPageToolbar>
        <Link
          href="/admin"
          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500"
        >
          {pick(lang, '返回后台首页', 'Back to dashboard')}
        </Link>
      </AdminPageToolbar>

      <AdminWorkspaceLayout
        main={
          <AdminSectionCard
            eyebrow={pick(lang, '评价管理', 'Testimonial management')}
            title={pick(lang, '客户评价列表', 'Customer testimonials')}
            description={pick(
              lang,
              '评价按排序字段升序排列，同排序按创建时间倒序。已发布的评价会在前台对应语言页面展示。',
              'Testimonials are sorted by sort order ascending, then by creation date descending. Published ones appear on the frontend in the matching locale.',
            )}
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
        }
        aside={
          <>
            <AdminSectionCard
              eyebrow={pick(lang, '评价统计', 'Testimonial stats')}
              title={pick(lang, '评价状态看板', 'Testimonial status panel')}
              description={pick(lang, '快速查看评价发布情况、语言分布与平均评分。', 'Quick overview of publish status, locale distribution and average rating.')}
              tone="dark"
            >
              <AdminStatGrid
                dark
                items={[
                  { label: pick(lang, '全部评价', 'Total'), value: items.length },
                  { label: pick(lang, '已发布', 'Published'), value: published },
                  { label: pick(lang, '未发布', 'Unpublished'), value: unpublished },
                  { label: pick(lang, '平均评分', 'Avg rating'), value: avgRating },
                ]}
              />
            </AdminSectionCard>

            <AdminSectionCard
              eyebrow={pick(lang, '语言分布', 'Locale breakdown')}
              title={pick(lang, '评价语言分布', 'Testimonials by locale')}
              description={pick(lang, '前台按语言分别展示评价，建议两种语言都保持有内容。', 'The frontend shows testimonials per locale. Keep both languages populated for best coverage.')}
            >
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '德语评价 (DE)', 'German testimonials (DE)')}</span>
                  <span className="font-semibold text-stone-900">{deCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '英语评价 (EN)', 'English testimonials (EN)')}</span>
                  <span className="font-semibold text-stone-900">{enCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '已发布 / 全部', 'Published / total')}</span>
                  <span className="font-semibold text-stone-900">{published} / {items.length}</span>
                </div>
              </div>
            </AdminSectionCard>

            <AdminSectionCard
              eyebrow={pick(lang, '管理建议', 'Management notes')}
              title={pick(lang, '评价运营建议', 'Testimonial management notes')}
              description={pick(lang, '保持评价内容真实、双语覆盖，有助于前台建立信任感。', 'Keep testimonials authentic and bilingual to build trust on the frontend.')}
            >
              <div className="space-y-3 text-sm leading-7 text-stone-600">
                <p>{pick(lang, '建议每种语言至少保持 3 条已发布评价，确保前台展示效果。', 'Aim for at least 3 published testimonials per locale to ensure a good frontend display.')}</p>
                <p>{pick(lang, '评分建议如实填写，不要全部填 5 星，适当的真实感更有说服力。', 'Use honest ratings — a mix of 4 and 5 stars feels more credible than all 5s.')}</p>
                <p>{pick(lang, '排序字段越小越靠前，可以把最有代表性的评价排在前面。', 'Lower sort order values appear first — put your most representative testimonials at the top.')}</p>
              </div>
            </AdminSectionCard>
          </>
        }
      />
    </AdminShell>
  )
}
