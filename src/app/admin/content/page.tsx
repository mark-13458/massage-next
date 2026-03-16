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
      subtitle={pick(lang, '管理首页主视觉、联系方式、营业时间、常见问题与图库内容。', 'Manage the homepage hero, contact details, opening hours, FAQ and gallery.')}
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
              <span className={`rounded-full px-4 py-2 text-sm font-medium ${data.stats.contactReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                {pick(lang, data.stats.contactReady ? '联系信息已就绪' : '联系信息待补充', data.stats.contactReady ? 'Contact ready' : 'Contact incomplete')}
              </span>
              <span className={`rounded-full px-4 py-2 text-sm font-medium ${data.stats.heroCopyReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                {pick(lang, data.stats.heroCopyReady ? '主视觉文案已就绪' : '主视觉文案待完善', data.stats.heroCopyReady ? 'Hero copy ready' : 'Hero copy incomplete')}
              </span>
              <span className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
                {pick(lang, `营业日 ${data.stats.openDayCount} 天`, `Open days: ${data.stats.openDayCount}`)}
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
                { label: pick(lang, '营业日', 'Open days'), value: data.stats.openDayCount },
                { label: pick(lang, '联系信息', 'Contact'), value: data.stats.contactReady ? pick(lang, '已就绪', 'Ready') : pick(lang, '待补充', 'Missing') },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </AdminSectionCard>

            <AdminSectionCard eyebrow={pick(lang, '快捷处理', 'Quick actions')} title={pick(lang, '内容管理快捷入口', 'Content quick actions')} description={pick(lang, '把高频内容维护动作收成直接入口，减少在长表单和不同页面之间跳转。', 'Collect common content-maintenance actions into direct shortcuts so the admin feels easier to operate day to day.') }>
              <div className="space-y-3 text-sm">
                <Link href="/admin/content#hero-section" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                  <span>{pick(lang, '继续维护首页主视觉', 'Continue hero maintenance')}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.stats.heroCopyReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{pick(lang, data.stats.heroCopyReady ? '已就绪' : '待完善', data.stats.heroCopyReady ? 'Ready' : 'Needs work')}</span>
                </Link>
                <Link href="/admin/content#faq-section" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                  <span>{pick(lang, '继续维护 FAQ 与营业时间', 'Continue FAQ and hours maintenance')}</span>
                  <span className="font-semibold text-stone-900">{data.stats.activeFaqCount}</span>
                </Link>
                <Link href="/admin/content#contact-section" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                  <span>{pick(lang, '补齐联系信息', 'Complete contact details')}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.stats.contactReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{pick(lang, data.stats.contactReady ? '已就绪' : '待补充', data.stats.contactReady ? 'Ready' : 'Missing')}</span>
                </Link>
                <Link href="/admin/gallery" className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 transition hover:border-stone-400">
                  <span>{pick(lang, '前往图库页巡检图片', 'Inspect media in gallery page')}</span>
                  <span className="font-semibold text-stone-900">{data.stats.galleryCount}</span>
                </Link>
              </div>
            </AdminSectionCard>

            <AdminSectionCard eyebrow={pick(lang, '内容待办', 'Content priorities')} title={pick(lang, '当前建议先处理', 'Suggested next content tasks')} description={pick(lang, '把内容运营里最常见的待处理项提到侧栏，减少每次从头阅读整页。', 'Pull the most common content follow-ups into the sidebar so operators do not need to reread the whole workspace every time.') }>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '主视觉图片状态', 'Hero image status')}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.hero?.imageUrl ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                    {pick(lang, data.hero?.imageUrl ? '已配置' : '待补充', data.hero?.imageUrl ? 'Ready' : 'Missing')}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, 'FAQ 启用情况', 'FAQ active status')}</span>
                  <span className="font-semibold text-stone-900">{data.stats.activeFaqCount} / {data.stats.faqCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '图库封面情况', 'Gallery cover status')}</span>
                  <span className="font-semibold text-stone-900">{data.stats.coverCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '联系信息完整度', 'Contact completeness')}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${data.stats.contactReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                    {pick(lang, data.stats.contactReady ? '已就绪' : '待补充', data.stats.contactReady ? 'Ready' : 'Missing')}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700">
                  <span>{pick(lang, '营业时间覆盖', 'Business hours coverage')}</span>
                  <span className="font-semibold text-stone-900">{data.stats.openDayCount} / 7</span>
                </div>
              </div>
            </AdminSectionCard>

            {data.hero?.imageUrl ? (
              <AdminSectionCard eyebrow={pick(lang, '主视觉预览', 'Hero preview')} title={pick(lang, '当前主视觉图片', 'Current hero image')} description={pick(lang, '这里显示当前已绑定到首页的主视觉图片路径，便于快速检查替换后的结果。', 'This shows the hero image currently bound to the homepage so you can quickly verify replacement results.') }>
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
