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
      subtitle={pick(lang, '内容管理继续增强：现在不仅能编辑 contact / hours / FAQ，也能接管首页 Hero 和图库基础内容。', 'Content management now goes beyond contact, hours and FAQ into homepage hero and gallery operations.')}
    >
      <AdminPageToolbar>
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回 Dashboard
        </Link>
      </AdminPageToolbar>

      <AdminWorkspaceLayout
        main={
          <AdminSectionCard
            eyebrow="Content Workspace"
            title="内容管理工作台"
            description="这一页负责首页 Hero、联系方式、营业时间、FAQ 与图库。先保留已有功能逻辑，再把结构改造成更清晰的内容运营台。"
          >
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
          <AdminSectionCard eyebrow="Content Stats" title="当前内容状态" description="给运营人员一个更直观的内容面板，减少在长表单里来回切换。" tone="dark">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'FAQ 总数', value: data.stats.faqCount },
                { label: '启用 FAQ', value: data.stats.activeFaqCount },
                { label: '图库图片', value: data.stats.galleryCount },
                { label: '封面数量', value: data.stats.coverCount },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>

            {data.hero?.imageUrl ? (
              <AdminSectionCard eyebrow="Hero Preview" title="当前 Hero 图片" description="这里显示当前已绑定到首页的 Hero 图片路径，便于快速检查替换后的结果。">
                <div className="space-y-4">
                  <img src={data.hero.imageUrl} alt={data.hero.titleDe || 'Hero preview'} className="h-52 w-full rounded-[24px] border border-stone-200 object-cover" />
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-6 text-stone-500">{data.hero.imageUrl}</div>
                </div>
              </AdminSectionCard>
            ) : (
              <AdminEmptyState title="当前还没有 Hero 图片" description="你可以在左侧内容工作台里直接上传 Hero 图片，或者手动填写图片 URL。" />
            )}
          </>
        }
      />
    </AdminShell>
  )
}
