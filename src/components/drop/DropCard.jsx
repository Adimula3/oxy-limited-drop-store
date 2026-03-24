import Link from 'next/link'
import Image from 'next/image'
import DropCountdown from './DropCountdown'

const STATUS_STYLES = {
  UPCOMING: 'bg-zinc-800 text-zinc-300',
  LIVE: 'bg-green-950 text-green-400',
  SOLD_OUT: 'bg-red-950 text-red-400',
  ENDED: 'bg-zinc-900 text-zinc-500',
}

function priceRange(products) {
  if (!products?.length) return null
  const prices = products.map((p) => p.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return `$${(min / 100).toFixed(0)}`
  return `$${(min / 100).toFixed(0)} – $${(max / 100).toFixed(0)}`
}

export default function DropCard({ drop }) {
  const price = priceRange(drop.products)

  return (
    <Link href={`/drops/${drop.id}`} className="group block">
      {/* Cover image */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-zinc-900">
        {drop.coverImage ? (
          <Image
            src={drop.coverImage}
            alt={drop.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold tracking-tighter text-zinc-700">OxY</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${STATUS_STYLES[drop.status]}`}>
            {drop.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="mb-1 font-semibold text-white transition-colors group-hover:text-zinc-300">
          {drop.name}
        </h3>
        {price && <p className="text-sm text-zinc-500">{price}</p>}
        {drop.status === 'UPCOMING' && drop.scheduledAt && (
          <DropCountdown scheduledAt={drop.scheduledAt} className="mt-2" />
        )}
      </div>
    </Link>
  )
}
