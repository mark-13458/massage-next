import { getBusinessHours, getContactSettings } from './site.service'
import { getFaqItems, getHeroSettingRecord } from '../repositories/admin/content.repository'
import { getAdminGalleryItems } from '../repositories/admin/media.repository'

export async function getAdminContentWorkspace() {
  if (!process.env.DATABASE_URL) {
    return { contact: null, hero: null, hours: [], faqs: [], gallery: [], stats: { faqCount: 0, activeFaqCount: 0, galleryCount: 0, coverCount: 0 } }
  }

  try {
    const [contact, heroSetting, hours, faqs, gallery] = await Promise.all([
      getContactSettings(),
      getHeroSettingRecord(),
      getBusinessHours('de'),
      getFaqItems(),
      getAdminGalleryItems(),
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
    return { contact: null, hero: null, hours: [], faqs: [], gallery: [], stats: { faqCount: 0, activeFaqCount: 0, galleryCount: 0, coverCount: 0 } }
  }
}
