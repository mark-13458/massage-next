import Link from 'next/link'
import { redirect } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import { AdminShell } from '../../../components/admin/AdminShell'
import { ContentEditor } from '../../../components/admin/ContentEditor'
import { getCurrentAdmin } from '../../../lib/auth'
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

  return (
    <AdminShell title="网站内容" subtitle="内容管理继续增强：现在不仅能编辑 contact / hours / FAQ，也能接管首页 Hero 和图库基础内容。">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回 Dashboard
        </Link>
      </div>

      <ContentEditor
        initialContact={data.contact}
        initialHero={data.hero}
        initialHours={data.hours}
        initialFaqs={data.faqs}
        initialGallery={data.gallery}
      />
    </AdminShell>
  )
}
