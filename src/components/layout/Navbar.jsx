'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingBag, User, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import CategoryDrawer from '@/components/layout/CategoryDrawer'

export default function Navbar() {
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4">

          {/* Left — DROPS trigger */}
          <div className="flex items-center">
            <button
              onClick={() => setDrawerOpen(true)}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 transition-colors hover:text-white"
            >
              Drops
            </button>
          </div>

          {/* Center — Logo */}
          <div className="flex justify-center">
            <Link href="/store" className="text-xl font-bold tracking-[0.3em] text-white">
              OxY
            </Link>
          </div>

          {/* Right — cart + account */}
          <div className="flex items-center justify-end gap-5">
            <Link
              href="/checkout"
              className="text-zinc-400 transition-colors hover:text-white"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
            </Link>

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center text-zinc-400 transition-colors hover:text-white"
                  aria-label="Account"
                  aria-expanded={dropdownOpen}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? 'Account'}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-xl">
                    {session.user?.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/account/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      My Orders
                    </Link>
                    <div className="my-1 border-t border-zinc-800" />
                    <button
                      onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/store' }) }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-zinc-400 transition-colors hover:text-white"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <CategoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
