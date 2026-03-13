import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState'
import { AdminSectionCard } from '../../../components/admin/AdminSectionCard'
import { AdminShell } from '../../../components/admin/AdminShell'
import { ContentEditor } from '../../../components/admin/ContentEditor'
import { getCurrentAdmin } from '../../../lib/auth'
import { getAdminLang, pick } from '../../../lib/admin-i18n'
import { getBusinessHours, getContactSettings } from '../../../server/services/site.service'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getContentData() {
  if (!process.env.DATABASE_URL) {
    return { contact: null, hero: null, hours: [], faqs: [], gallery: [] }
  }

  try {
    const [contact, heroSetting, hours, faqs, gallery] = await Promise.all([
      getContactSettings(),
      prisma.siteSetting.findUnique({ where: { key: 'hero' } }),
      getBusinessHours('de'),
      prisma.faqItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
      prisma.galleryImage.findMany({ include: { file: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
    ])

    const heroValue = heroSetting?.value && typeof heroSetting.value === 'object' && !Array.isArray(heroSetting.value)
      ? (heroSetting.value as Record<string, unknown>)
      : null

    return {
      contact,
      hero: heroValue
        ? {
            eyebrowDe: typeof heroValue.eyebrowDe === 'string' ? heroValue.eyebrowDe : '',
            eyebrowEn: typeof heroValue.eyebrowEn === 'string' ? heroValue.eyebrowEn : '',
            titleDe: typeof heroValue.titleDe === 'string' ? heroValue.titleDe : '',
            titleEn: typeof heroValue.titleEn === 'string' ? heroValue.titleEn : '',
            subtitleDe: typeof heroValue.subtitleDe === 'string' ? heroValue.subtitleDe : '',
            subtitleEn: typeof heroValue.subtitleEn === 'string' ? heroValue.subtitleEn : '',
            noteDe: typeof heroValue.noteDe === 'string' ? heroValue.noteDe : '',
            noteEn: typeof heroValue.noteEn === 'string' ? heroValue.noteEn : '',
            imageUrl: typeof heroValue.imageUrl === 'string' ? heroValue.imageUrl : '',
          }
        : null,
      hours,
      stats: {
        faqCount: faqs.length,
        activeFaqCount: faqs.filter((item) => item.isActive).length,
        galleryCount: gallery.length,
        coverCount: gallery.filter((item) => item.isCover).length,
      },
      faqs: faqs.map((item) => ({
        id: item.id,
        questionDe: item.questionDe,
        questionEn: item.questionEn,
        answerDe: item.answerDe,
        answerEn: item.answerEn,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      })),
      gallery: gallery.map((item) => ({
        id: item.id,
        titleDe: item.titleDe || '',
        titleEn: item.titleEn || '',
        altDe: item.altDe || '',
        altEn: item.altEn || '',
        imageUrl: item.file.filePath,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
        isCover: item.isCover,
      })),
    }
  } catch {
    return { contact: null, hero: null, hours: [], faqs: [], gallery: [] }
  }
}

export default async function AdminContentPage() {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/admin/login')

  const data = await getContentData()
  const lang = await getAdminLang()

  return (
    <AdminShell
      lang={lang}
      title={pick(lang, '网站内容', 'Content')}
      subtitle={pick(lang, '内容管理继续增强：现在不仅能编辑 contact / hours / FAQ，也能接管首页 Hero 和图库基础内容。', 'Content management now goes beyond contact, hours and FAQ into homepage hero and gallery operations.')}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <AdminSectionCard
            eyebrow="Content Workspace"
            title="内容管理工作台"
            description="这一页负责首页 Hero、联系方式、营业时间、FAQ 与图库。先保留已有功能逻辑，再把结构改造成更清晰的内容运营台。"
            actions={
              <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
                返回 Dashboard
              </Link>
            }
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
        </div>

        <div className="space-y-6">
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
        </div>
      </div>
    </AdminShell>
  )
}
