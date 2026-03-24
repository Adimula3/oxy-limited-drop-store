import { notFound } from 'next/navigation'
import Image from 'next/image'
import prisma from '@/lib/db'
import DropCountdown from '@/components/drop/DropCountdown'
import StockIndicator from '@/components/drop/StockIndicator'
import BuyButton from '@/components/drop/BuyButton'

export async function generateMetadata({ params }) {
  const { id } = await params
  const drop = await prisma.drop.findUnique({ where: { id } })
  return { title: drop ? `${drop.name} — OxY` : 'Not Found' }
}

const STATUS_STYLES = {
  UPCOMING: 'bg-zinc-800 text-zinc-300',
  LIVE: 'bg-green-950 text-green-400',
  SOLD_OUT: 'bg-red-950 text-red-400',
  ENDED: 'bg-zinc-900 text-zinc-500',
}

export default async function DropPage({ params, searchParams }) {
  const { id } = await params
  const sp = await searchParams
  const type = sp?.type?.toUpperCase() ?? null
  const gender = sp?.gender?.toUpperCase() ?? null

  const productFilter = {}
  if (type) productFilter.type = type
  if (gender) productFilter.gender = gender
  const hasFilter = type || gender

  const drop = await prisma.drop.findUnique({
    where: { id },
    include: {
      products: hasFilter ? { where: productFilter } : true,
    },
  })

  if (!drop) notFound()

  const isLive = drop.status === 'LIVE'
  const totalStock = drop.products.reduce((sum, p) => sum + (p.stock - p.sold), 0)

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Cover image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-900">
          {drop.coverImage ? (
            <Image
              src={drop.coverImage}
              alt={drop.name}
              fill
              unoptimized
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl font-bold tracking-tighter text-zinc-700">OxY</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            <span className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${STATUS_STYLES[drop.status]}`}>
              {drop.status.replace('_', ' ')}
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">{drop.name}</h1>

          {drop.description && (
            <p className="mb-6 text-sm leading-relaxed text-zinc-400">{drop.description}</p>
          )}

          {drop.status === 'UPCOMING' && drop.scheduledAt && (
            <div className="mb-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Drops In</p>
              <DropCountdown scheduledAt={drop.scheduledAt} />
            </div>
          )}

          {/* Products */}
          <div className="mb-8 space-y-2">
            {drop.products.length === 0 ? (
              <p className="text-sm text-zinc-600">No products match this filter.</p>
            ) : (
              drop.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-zinc-600">SKU: {product.sku}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                    <StockIndicator stock={product.stock - product.sold} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Buy button — client component for interactivity */}
          <BuyButton
            dropId={drop.id}
            products={drop.products.map((p) => ({
              id: p.id,
              name: p.name,
              stock: p.stock - p.sold,
            }))}
            isLive={isLive}
            totalStock={totalStock}
            dropStatus={drop.status}
          />

          {isLive && drop.maxPerUser > 1 && (
            <p className="mt-3 text-center text-xs text-zinc-600">
              Max {drop.maxPerUser} per customer
            </p>
          )}

          {(drop.scheduledAt || drop.endsAt) && (
            <div className="mt-6 space-y-1 border-t border-zinc-800 pt-6">
              {drop.scheduledAt && (
                <p className="text-xs text-zinc-600">
                  Starts:{' '}
                  <span className="text-zinc-400">
                    {new Date(drop.scheduledAt).toLocaleString()}
                  </span>
                </p>
              )}
              {drop.endsAt && (
                <p className="text-xs text-zinc-600">
                  Ends:{' '}
                  <span className="text-zinc-400">
                    {new Date(drop.endsAt).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
