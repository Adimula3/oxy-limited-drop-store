import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <Link href="/store" className="text-lg font-bold tracking-[0.3em] text-white">
            OxY
          </Link>

          <nav className="flex gap-8">
            <Link
              href="/drops"
              className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Drops
            </Link>
            <Link
              href="/account/orders"
              className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Orders
            </Link>
            <Link
              href="/login"
              className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-zinc-300"
            >
              Account
            </Link>
          </nav>

          <p className="text-xs text-zinc-700">
            &copy; {new Date().getFullYear()} OxY. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
