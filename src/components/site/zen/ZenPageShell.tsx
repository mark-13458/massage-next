import { Locale } from '../../../lib/i18n'
import { getMessages } from '../../../lib/copy'
import { getSystemSettings } from '../../../server/services/site.service'
import { prisma } from '../../../lib/prisma'
import { ZenHeader } from './ZenHeader'
import { ZenFooter } from './ZenFooter'
import { FloatingActions } from '../FloatingActions'

interface Props {
  locale: Locale
  children: React.ReactNode
}

export async function ZenPageShell({ locale, children }: Props) {
  const t = getMessages(locale)
  const settings = await getSystemSettings().catch(() => null)
  const siteName = settings?.siteName || 'Zen Oase'

  let logoUrl: string | null = null
  if (settings?.logoFileId) {
    const logoFile = await prisma.file.findUnique({
      where: { id: settings.logoFileId },
      select: { filePath: true },
    }).catch(() => null)
    logoUrl = logoFile?.filePath ?? null
  }

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/services`, label: t.nav.services },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/gallery`, label: t.nav.gallery },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#3D3630]">
      <ZenHeader locale={locale} siteName={siteName} navLinks={navLinks} bookingLabel={t.nav.booking} logoUrl={logoUrl} />
      <main className="flex-1 pb-24 sm:pb-0">
        {children}
        <FloatingActions locale={locale} />
      </main>
      <ZenFooter locale={locale} />
    </div>
  )
}
