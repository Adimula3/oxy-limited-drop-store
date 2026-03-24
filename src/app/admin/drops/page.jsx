import Link from 'next/link'
import { Plus } from 'lucide-react'
import prisma from '@/lib/db'
import DeleteDropButton from '@/components/admin/DeleteDropButton'

export const metadata = { title: 'Drops — Admin' }

const STATUS_STYLES = {
  UPCOMING: 'bg-zinc-800 text-zinc-300',
  LIVE: 'bg-green-950 text-green-400',
  SOLD_OUT: 'bg-amber-950 text-amber-400',
  ENDED: 'bg-zinc-900 text-zinc-600',
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminDropsPage() {
  const drops = await prisma.drop.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Drops</h1>
        <Link
          href="/admin/drops/new"
          className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" />
          New Drop
        </Link>
      </div>

      {drops.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-16 text-center">
          <p className="text-sm text-zinc-600">No drops yet.</p>
          <Link
            href="/admin/drops/new"
            className="mt-4 inline-block text-xs text-zinc-400 transition-colors hover:text-white"
          >
            Create your first drop →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Name</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Status</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500 md:table-cell">Scheduled</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500 sm:table-cell">Products</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drops.map((drop) => (
                <tr key={drop.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{drop.name}</p>
                    <p className="text-xs text-zinc-600">{drop.slug}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${STATUS_STYLES[drop.status]}`}>
                      {drop.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-zinc-400 md:table-cell">
                    {formatDate(drop.scheduledAt)}
                  </td>
                  <td className="hidden px-4 py-4 text-zinc-400 sm:table-cell">
                    {drop._count.products}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/drops/${drop.id}/edit`}
                        className="text-xs text-zinc-400 transition-colors hover:text-white"
                      >
                        Edit
                      </Link>
                      <DeleteDropButton id={drop.id} name={drop.name} status={drop.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
