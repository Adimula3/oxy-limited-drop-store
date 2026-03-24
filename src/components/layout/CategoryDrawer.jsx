'use client'

import Link from 'next/link'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const NEW_RELEASES_LINKS = [
  { label: 'New OxY', href: '/drops?type=OXY' },
  { label: 'New Apparel', href: '/drops?type=APPAREL' },
  { label: 'New Lifestyle', href: '/drops?type=LIFESTYLE' },
  { label: 'New Footwear', href: '/drops?type=FOOTWEAR' },
  { label: 'All Brands', href: '/drops?type=BRANDS' },
]

const GENDER_LINKS = [
  { label: 'Men', href: '/drops?gender=MEN' },
  { label: 'Women', href: '/drops?gender=WOMEN' },
  { label: 'Kids', href: '/drops?gender=KIDS' },
]

export default function CategoryDrawer({ open, onClose }) {
  const [releasesOpen, setReleasesOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setReleasesOpen(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-black transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Category navigation"
      >
        {/* Close button */}
        <div className="flex items-center justify-end border-b border-zinc-800 px-6 py-5">
          <button
            onClick={onClose}
            className="text-zinc-400 transition-colors hover:text-white"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-6 pt-8 overflow-y-auto">
          {/* Explore New Releases — expandable */}
          <div>
            <button
              onClick={() => setReleasesOpen((prev) => !prev)}
              className="flex w-full items-center justify-between py-3 text-left text-2xl font-bold uppercase tracking-tight text-white transition-colors hover:text-zinc-400"
            >
              <span>Explore New Releases</span>
              {releasesOpen
                ? <ChevronUp className="h-5 w-5 shrink-0" />
                : <ChevronDown className="h-5 w-5 shrink-0" />}
            </button>

            {releasesOpen && (
              <div className="mb-2 flex flex-col gap-1 pl-3 pt-1">
                {NEW_RELEASES_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="py-2 text-lg font-semibold uppercase tracking-tight text-zinc-300 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-zinc-800" />

          {/* Gender links */}
          {GENDER_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="py-3 text-2xl font-bold uppercase tracking-tight text-white transition-colors hover:text-zinc-400"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
