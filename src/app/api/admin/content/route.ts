import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { apiError, apiOk } from '../../../../lib/api-response'
import { getCurrentAdmin } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { deleteUpload } from '../../../../lib/uploads'
import { CACHE_TAGS } from '../../../../server/services/site.service'

export async function PATCH(request: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return apiError('DATABASE_URL is not configured', 500)
  }

  const admin = await getCurrentAdmin()
  if (!admin) {
    return apiError('Unauthorized', 401)
  }

  try {
    const json = await request.json()
    const contact = json.contact
    const hero = json.hero
    const hours = Array.isArray(json.hours) ? json.hours : []
    const faqs = Array.isArray(json.faqs) ? json.faqs : []
    const gallery = Array.isArray(json.gallery) ? json.gallery : []
    const hasContactPayload = contact && typeof contact === 'object' && !Array.isArray(contact) && Object.keys(contact).length > 0
    const hasHeroPayload = hero && typeof hero === 'object' && !Array.isArray(hero) && Object.keys(hero).length > 0

    if (hasContactPayload) {
      await prisma.siteSetting.upsert({ where: { key: 'contact' }, update: { value: contact }, create: { key: 'contact', value: contact } })
    }

    if (hasHeroPayload) {
      const existingHeroSetting = await prisma.siteSetting.findUnique({ where: { key: 'hero' } })
      const existingHeroValue = existingHeroSetting?.value && typeof existingHeroSetting.value === 'object' && !Array.isArray(existingHeroSetting.value)
        ? (existingHeroSetting.value as Record<string, unknown>)
        : null
      const previousImageUrl = typeof existingHeroValue?.imageUrl === 'string' ? existingHeroValue.imageUrl : null
      const nextImageUrl = typeof hero.imageUrl === 'string' ? hero.imageUrl : null

      await prisma.siteSetting.upsert({ where: { key: 'hero' }, update: { value: hero }, create: { key: 'hero', value: hero } })

      if (previousImageUrl && previousImageUrl !== nextImageUrl) {
        await deleteUpload(previousImageUrl)
      }
    }

    for (const item of hours) {
      if (typeof item.weekday !== 'number') continue
      await prisma.businessHour.upsert({
        where: { weekday: item.weekday },
        update: {
          openTime: item.openTime || null,
          closeTime: item.closeTime || null,
          isClosed: Boolean(item.isClosed),
        },
        create: {
          weekday: item.weekday,
          dayLabelDe: item.dayLabelDe || `Tag ${item.weekday}`,
          dayLabelEn: item.dayLabelEn || `Day ${item.weekday}`,
          openTime: item.openTime || null,
          closeTime: item.closeTime || null,
          isClosed: Boolean(item.isClosed),
        },
      })
    }

    for (const item of faqs) {
      if (item._delete && typeof item.id === 'number') {
        const existingFaq = await prisma.faqItem.findUnique({ where: { id: item.id } })
        if (!existingFaq) continue
        await prisma.faqItem.delete({ where: { id: item.id } })
        continue
      }
      if (item._create) {
        await prisma.faqItem.create({ data: { questionDe: item.questionDe || '', questionEn: item.questionEn || '', answerDe: item.answerDe || '', answerEn: item.answerEn || '', sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0, isActive: Boolean(item.isActive) } })
        continue
      }
      if (typeof item.id !== 'number') continue
      const existingFaq = await prisma.faqItem.findUnique({ where: { id: item.id } })
      if (!existingFaq) continue
      await prisma.faqItem.update({ where: { id: item.id }, data: { questionDe: item.questionDe || '', questionEn: item.questionEn || '', answerDe: item.answerDe || '', answerEn: item.answerEn || '', sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0, isActive: Boolean(item.isActive) } })
    }

    const hasGalleryPayload = gallery.length > 0
    const coverGalleryId = hasGalleryPayload
      ? gallery.find((item) => !item._delete && Boolean(item.isCover) && typeof item.id === 'number')?.id ?? null
      : null

    for (const item of gallery) {
      if (item._delete && typeof item.id === 'number') {
        const existing = await prisma.galleryImage.findUnique({ where: { id: item.id }, include: { file: true } })
        if (!existing) continue
        await prisma.galleryImage.delete({ where: { id: item.id } })
        if (existing.fileId) {
          await deleteUpload(existing.file?.filePath)
          await prisma.file.delete({ where: { id: existing.fileId } }).catch(() => null)
        }
        continue
      }

      if (item._create) {
        const createdFile = await prisma.file.create({
          data: {
            originalFilename: item.titleDe || item.titleEn || 'gallery-image',
            storedFilename: item.titleDe || item.titleEn || 'gallery-image',
            filePath: item.imageUrl || '',
            fileSize: 0,
            mimeType: 'image/jpeg',
            kind: 'IMAGE',
            altText: item.altDe || item.altEn || null,
            isPublic: true,
          },
        })

        await prisma.galleryImage.create({
          data: {
            titleDe: item.titleDe || null,
            titleEn: item.titleEn || null,
            altDe: item.altDe || null,
            altEn: item.altEn || null,
            sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
            isActive: Boolean(item.isActive),
            isCover: Boolean(item.isCover) && coverGalleryId === null,
            fileId: createdFile.id,
          },
        })
        continue
      }

      if (typeof item.id !== 'number') continue
      const existing = await prisma.galleryImage.findUnique({ where: { id: item.id } })

      await prisma.galleryImage.update({
        where: { id: item.id },
        data: {
          titleDe: item.titleDe || null,
          titleEn: item.titleEn || null,
          altDe: item.altDe || null,
          altEn: item.altEn || null,
          sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : 0,
          isActive: Boolean(item.isActive),
          isCover: item.id === coverGalleryId,
        },
      })

      if (existing?.fileId && item.imageUrl && existing.file?.filePath !== item.imageUrl) {
        // If image URL changed and it was a local file, clean up the old one
        await deleteUpload(existing.file?.filePath)
        
        // Update file record
        await prisma.file.update({
          where: { id: existing.fileId },
          data: {
            filePath: item.imageUrl,
            altText: item.altDe || item.altEn || null
          }
        })
      } else if (existing?.fileId) {
        // Just update alt text if image didn't change
        await prisma.file.update({
          where: { id: existing.fileId },
          data: { altText: item.altDe || item.altEn || null }
        })
      }
    }

    if (hasContactPayload) revalidateTag(CACHE_TAGS.contact)
    if (hasHeroPayload) revalidateTag(CACHE_TAGS.hero)
    if (hours.length > 0) revalidateTag(CACHE_TAGS.hours)
    if (faqs.length > 0) revalidateTag(CACHE_TAGS.faqs)
    if (hasGalleryPayload) revalidateTag(CACHE_TAGS.gallery)

    return apiOk()
  } catch (error) {
    console.error('[admin/content] unexpected error:', error)
    return apiError('Internal server error', 500)
  }
}
