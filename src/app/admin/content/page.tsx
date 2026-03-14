import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { AdminPageToolbar } from '../../../components/admin/AdminPageToolbar'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminShell } from '../../../components/admin/AdminShell'
import { AdminWorkspaceLayout } from '../../../components/admin/AdminWorkspaceLayout'
import { ContentEditor } from '../../../components/admin/ContentEditor'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getAdminContentWorkspace } from '../../../server/services/admin-content.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminContentPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const data = await getAdminContentWorkspace()
  const lang = await getAdminLang()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '网站内容', 'Content')}
      subtitle={pick(lang, '内容管理继续增强：现在不仅能编辑联系信息、营业时间、常见问题，也能接管首页主视觉和图库基础内容。', 'Content management now goes beyond contact, hours and FAQ into homepage hero and gallery operations.')}
    >
      <AdminPageToolbar>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          {pick(lang, '返回后台首页', 'Back to dashboard')}
        </Link>
      </AdminPageToolbar>

      <AdminWorkspaceLayout
        main={
          <AdminSectionCard
            eyebrow={pick(lang, '内容工作区', 'Content workspace')}
            title={pick(lang, '内容管理工作区', 'Content workspace')}
            description={pick(lang, '这一页负责首页主视觉、联系方式、营业时间、常见问题与图库。先保留已有功能逻辑，再把结构改造成更清晰的内容运营台。', 'This workspace manages the homepage hero, contact details, opening hours, FAQ and gallery. It keeps the current functionality while making the content workflow clearer.')}
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700">
                {pick(lang, data.hero?.imageUrl ? '主视觉图片已配置' : '主视觉图片待补充', data.hero?.imageUrl ? 'Hero image ready' : 'Hero image missing')}
              </span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                {pick(lang, `FAQ 总数 ${data.stats.faqCount} 条`, `Total FAQs: ${data.stats.faqCount}`)}
              </span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                {pick(lang, `启用 FAQ ${data.stats.activeFaqCount} 条`, `Active FAQs: ${data.stats.activeFaqCount}`)}
              </span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                {pick(lang, `图库图片 ${data.stats.galleryCount} 张`, `Gallery images: ${data.stats.galleryCount}`)}
              </span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                {pick(lang, `封面图片 ${data.stats.coverCount} 张`, `Cover images: ${data.stats.coverCount}`)}
              </span>
            </div>
            <ContentEditor
              lang={lang}
              initialContact={data.contact}
              initialHero={data.hero}
              initialHours={data.hours}
              initialFaqs={data.faqs}
              initialGallery={data.gallery}
            />
          </AdminSectionCard>
        }
        aside={
          <>
          <AdminSectionCard eyebrow={pick(lang, '内容统计', 'Content stats')} title={pick(lang, '当前内容状态', 'Current content status')} description={pick(lang, '给运营人员一个更直观的内容看板，减少在长表单里来回切换。', 'Give operators a clearer content overview and reduce back-and-forth across long forms.')} tone="dark">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: pick(lang, 'FAQ 总数', 'Total FAQs'), value: data.stats.faqCount },
                { label: pick(lang, '启用 FAQ', 'Active FAQs'), value: data.stats.activeFaqCount },
                { label: pick(lang, '图库图片', 'Gallery images'), value: data.stats.galleryCount },
                { label: pick(lang, '封面数量', 'Cover images'), value: data.stats.coverCount },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>

            {data.hero?.imageUrl ? (
              <AdminSectionCard eyebrow={pick(lang, '主视觉预览', 'Hero preview')} title={pick(lang, '当前主视觉图片', 'Current hero image')} description={pick(lang, '这里显示当前已绑定到首页的主视觉图片路径，便于快速检查替换后的结果。', 'This shows the hero image currently bound to the homepage so you can quickly verify replacement results.')}>
                <div className="space-y-4">
                  <img src={data.hero.imageUrl} alt={data.hero.titleDe || 'Hero preview'} className="h-52 w-full rounded-[24px] border border-stone-200 object-cover" />
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-6 text-stone-500">{data.hero.imageUrl}</div>
                </div>
              </AdminSectionCard>
            ) : (
              <AdminEmptyState title={pick(lang, '当前还没有主视觉图片', 'No hero image yet')} description={pick(lang, '你可以在左侧内容工作区里直接上传主视觉图片，或者手动填写图片地址。', 'You can upload a hero image from the content workspace on the left, or enter an image URL manually.')} />
            )}
          </>
        }
      />
    </AdminShell>
  )
}
