'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  locale: string
  navLinks: { href: string; label: string }[]
  bookingLabel: string
}

export function MobileMenu({ locale, navLinks, bookingLabel }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const otherLocale = locale === 'de' ? 'en' : 'de'
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="flex h-10 w-10 items-center justify-center rounded-full text-brown-800 transition hover:bg-stone-100 active:bg-stone-200"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="3" y1="6" x2="17" y2="6" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="14" x2="17" y2="14" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 top-16 z-40 bg-stone-950/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed left-0 right-0 top-16 z-50 border-b border-stone-200 bg-white px-4 py-4 shadow-xl transition-all duration-200 ${
          open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-brown-800 transition hover:bg-stone-50 active:bg-stone-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-stone-100 pt-3 flex flex-col gap-2">
            <Link
              href={`/${locale}/booking`}
              className="block rounded-full bg-brown-800 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-brown-700 active:bg-brown-900"
            >
              {bookingLabel}
            </Link>
            <Link
              href={otherPath}
              className="block rounded-full border border-stone-200 px-4 py-2.5 text-center text-sm font-medium text-brown-700 transition hover:border-brown-300 hover:text-brown-900"
            >
              {otherLocale === 'de' ? 'Deutsch' : 'English'}
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}
