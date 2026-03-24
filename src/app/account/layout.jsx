import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'

export default async function AccountLayout({ children }) {
  const session = await auth()

  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
          <Link
            href="/store"
            className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Store
          </Link>
        </div>

        {/* Tab nav */}
        <nav className="mb-8 flex border-b border-zinc-800">
          <Link
            href="/account/orders"
            className="flex items-center gap-2 border-b-2 border-white px-4 py-3 text-sm font-medium text-white"
          >
            <Package className="h-4 w-4" />
            Orders
          </Link>
        </nav>

        {children}
      </div>
    </div>
  )
}
