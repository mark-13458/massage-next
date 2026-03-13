const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  await prisma.businessHour.deleteMany()
  await prisma.faqItem.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.galleryImage.deleteMany()
  await prisma.file.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.service.deleteMany()
  await prisma.siteSetting.deleteMany()
  await prisma.emailLog.deleteMany()
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', 10)

  await prisma.user.create({
    data: {
      email: (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase(),
      passwordHash: adminPassword,
      name: process.env.ADMIN_NAME || 'Admin',
      role: 'ADMIN',
      isActive: true,
    },
  })

  const services = await prisma.$transaction([
    prisma.service.create({
      data: {
        slug: 'traditional-full-body',
        nameDe: 'Traditionelle Ganzkörpermassage',
        nameEn: 'Traditional full body massage',
        summaryDe: 'Ganzheitliche Behandlung für tiefe Entspannung und bessere Balance im Alltag.',
        summaryEn: 'A balanced full-body treatment designed for deep relaxation and everyday recovery.',
        descriptionDe: 'Diese Anwendung verbindet klassische Techniken der traditionellen chinesischen Massage mit einer ruhigen, modernen Studioatmosphäre.',
        descriptionEn: 'This treatment combines classic traditional Chinese massage techniques with a calm, modern studio atmosphere.',
        durationMin: 60,
        price: 68.0,
        sortOrder: 1,
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        slug: 'foot-reflex',
        nameDe: 'Fußreflexzonenmassage',
        nameEn: 'Foot reflex massage',
        summaryDe: 'Ideal gegen Müdigkeit, schwere Beine und stressige Arbeitstage.',
        summaryEn: 'Ideal for tired feet, heavy legs and stressful workdays.',
        descriptionDe: 'Fokussierte Behandlung zur Entspannung und Aktivierung wichtiger Reflexpunkte.',
        descriptionEn: 'A focused treatment to relax and activate key reflex points.',
        durationMin: 45,
        price: 55.0,
        sortOrder: 2,
        isFeatured: true,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        slug: 'hot-stone',
        nameDe: 'Hot-Stone Massage',
        nameEn: 'Hot stone massage',
        summaryDe: 'Wärme, Entschleunigung und ein besonders ruhiges Wellness-Erlebnis.',
        summaryEn: 'Warmth, calm and a premium wellness experience.',
        descriptionDe: 'Warme Steine unterstützen die Lockerung der Muskulatur und vertiefen die Erholung.',
        descriptionEn: 'Warm stones help loosen the muscles and deepen the relaxation effect.',
        durationMin: 90,
        price: 96.0,
        sortOrder: 3,
        isFeatured: true,
        isActive: true,
      },
    }),
  ])

  await prisma.$transaction([
    prisma.testimonial.create({
      data: {
        customerName: 'Anna M.',
        locale: 'de',
        rating: 5,
        content: 'Sehr angenehme Atmosphäre, professionelle Behandlung und eine klare Kommunikation von Anfang bis Ende.',
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        customerName: 'Lena K.',
        locale: 'de',
        rating: 5,
        content: 'Die Buchung war unkompliziert und die Massage hat mir nach einer stressigen Woche sehr gut getan.',
        sortOrder: 2,
        isPublished: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        customerName: 'David R.',
        locale: 'en',
        rating: 5,
        content: 'Clean, calm and professional. The service felt thoughtful and premium without being complicated.',
        sortOrder: 1,
        isPublished: true,
      },
    }),
    prisma.testimonial.create({
      data: {
        customerName: 'Emily S.',
        locale: 'en',
        rating: 5,
        content: 'Simple booking, warm welcome and a treatment that felt genuinely restorative.',
        sortOrder: 2,
        isPublished: true,
      },
    }),
  ])

  const weekdaysDe = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  const weekdaysEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  await prisma.$transaction(
    weekdaysDe.map((day, index) =>
      prisma.businessHour.create({
        data: {
          weekday: index + 1,
          dayLabelDe: day,
          dayLabelEn: weekdaysEn[index],
          openTime: '09:30',
          closeTime: index === 6 ? '18:00' : '20:00',
          isClosed: false,
        },
      }),
    ),
  )

  await prisma.$transaction([
    prisma.faqItem.create({
      data: {
        questionDe: 'Muss ich vorab bezahlen?',
        questionEn: 'Do I need to pay in advance?',
        answerDe: 'Nein. Die Anfrage reserviert zunächst den Terminwunsch. Die finale Bestätigung erfolgt durch das Studio.',
        answerEn: 'No. Your request reserves the preferred slot first, and the studio confirms the appointment afterwards.',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.faqItem.create({
      data: {
        questionDe: 'Welche Sprache wird gesprochen?',
        questionEn: 'Which languages are spoken?',
        answerDe: 'Deutsch, Englisch und Chinesisch sind für die Terminabstimmung möglich.',
        answerEn: 'German, English and Chinese are all available for appointment coordination.',
        sortOrder: 2,
        isActive: true,
      },
    }),
  ])

  await prisma.$transaction([
    prisma.siteSetting.create({
      data: {
        key: 'contact',
        value: {
          phone: '015563 188800',
          email: 'chinesischemassage8@gmail.com',
          address: 'Arnulfstraße 104, 80636 München',
        },
      },
    }),
    prisma.siteSetting.create({
      data: {
        key: 'hero',
        value: {
          eyebrowDe: 'Traditionelle chinesische Massage in München',
          eyebrowEn: 'Traditional Chinese massage in Munich',
          titleDe: 'Wärme, Ruhe und professionelle Behandlung an einem Ort.',
          titleEn: 'Warmth, calm and professional treatment in one place.',
          subtitleDe: 'Ein moderner Studioauftritt für Gäste, die Entspannung, Klarheit und einfache Terminbuchung suchen.',
          subtitleEn: 'A modern studio experience for guests looking for relaxation, clarity and a simple booking flow.',
          noteDe: 'Ein ruhiger, warmer und professioneller Markenauftritt für Studio, Gäste und Terminbuchung.',
          noteEn: 'A calm, warm and professional brand presence for the studio, its guests and the booking flow.',
          imageUrl: 'https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200',
        },
      },
    }),
  ])

  console.log(`Seeded ${services.length} services`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
