import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/drops', icon: Package, label: 'Drops' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
]

export default async function AdminLayout({ children }) {
  const session = await auth()

  if (!session || session.user?.role !== 'ADMIN') redirect('/login')

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-zinc-800">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
          <Link href="/" className="text-lg font-bold tracking-[0.3em] text-white">
            OxY
          </Link>
          <span className="text-xs uppercase tracking-widest text-zinc-600">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Back to store */}
        <div className="border-t border-zinc-800 p-4">
          <Link
            href="/store"
            className="flex items-center gap-2 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-auto">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
