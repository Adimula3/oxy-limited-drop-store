import Link from 'next/link'
import prisma from '@/lib/db'
import DropCard from '@/components/drop/DropCard'

export const metadata = { title: 'Store' }

export default async function StorePage() {
  const featuredDrops = await prisma.drop.findMany({
    include: { products: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.5em] text-zinc-500">New Season</p>
        <h1 className="mb-6 text-6xl font-bold tracking-tighter md:text-8xl">
          Limited Drops
        </h1>
        <p className="mb-10 max-w-md text-sm text-zinc-400">
          Exclusive limited-edition releases. Each drop is rare.
          <br />
          Each piece is yours — if you&apos;re quick enough.
        </p>
        <Link
          href="/drops"
          className="inline-flex h-12 items-center rounded-full bg-white px-10 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200"
        >
          View All Drops
        </Link>
      </section>

      {/* Featured drops */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.3em] text-zinc-500">Latest</p>
            <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
          </div>
          <Link
            href="/drops"
            className="text-xs uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
          >
            View All →
          </Link>
        </div>

        {featuredDrops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDrops.map((drop) => (
              <DropCard key={drop.id} drop={drop} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-zinc-600">
            No drops yet — check back soon.
          </p>
        )}
      </section>
    </div>
  )
}
