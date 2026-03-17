'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Locale } from '../../../lib/i18n'

interface Props {
  locale: Locale
  siteName: string
  navLinks: { href: string; label: string }[]
  bookingLabel: string
}

export function ZenHeader({ locale, siteName, navLinks, bookingLabel }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  function switchLang() {
    const next = locale === 'de' ? 'en' : 'de'
    const newPath = pathname.replace(/^\/(de|en)(\/|$)/, `/${next}$2`)
    router.push(newPath)
  }

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(155,126,92,0.15)] bg-[#FFFFFF]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B7E5C]">
              <span className="text-lg font-semibold text-white">Z</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-[#3D3630]">{siteName}</span>
              <span className="text-xs tracking-wide text-[#8C7D6F]">WELLNESS STUDIO</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center space-x-1 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-4 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#9B7E5C] text-white'
                    : 'text-[#3D3630] hover:bg-[#E8DFD4]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Lang + mobile toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={switchLang}
              className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-[#3D3630] transition-colors hover:bg-[#E8DFD4]"
              aria-label="Switch language"
            >
              <Globe className="h-4 w-4" />
              <span>{locale.toUpperCase()}</span>
            </button>
            <Link
              href={`/${locale}/booking`}
              className="hidden rounded-md bg-[#9B7E5C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#9B7E5C]/90 md:inline-flex"
            >
              {bookingLabel}
            </Link>
            <button
              className="rounded-md p-2 text-[#3D3630] hover:bg-[#E8DFD4] md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <nav className="border-t border-[rgba(155,126,92,0.15)] py-4 md:hidden">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block rounded-md px-4 py-3 text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-[#9B7E5C] text-white'
                    : 'text-[#3D3630] hover:bg-[#E8DFD4]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/booking`}
              onClick={() => setIsOpen(false)}
              className="mt-2 block rounded-md bg-[#9B7E5C] px-4 py-3 text-center text-sm font-medium text-white"
            >
              {bookingLabel}
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
