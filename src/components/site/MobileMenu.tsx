'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  locale: string
  navLinks: { href: string; label: string }[]
  bookingLabel: string
}

export function MobileMenu({ locale, navLinks, bookingLabel }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-brown-800 transition hover:bg-stone-100"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="17" y2="6" />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="14" x2="17" y2="14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-stone-200 bg-white px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-brown-800 transition hover:bg-stone-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/booking`}
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-brown-800 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-brown-700"
            >
              {bookingLabel}
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
