import prisma from '@/lib/db'
import DropCard from '@/components/drop/DropCard'

export const metadata = { title: 'Drops' }

const PAGE_TITLES = {
  type: {
    OXY: 'New OxY',
    APPAREL: 'New Apparel',
    LIFESTYLE: 'New Lifestyle',
    FOOTWEAR: 'New Footwear',
    BRANDS: 'All Brands',
  },
  gender: {
    MEN: 'Men',
    WOMEN: 'Women',
    KIDS: 'Kids',
  },
}

export default async function DropsPage({ searchParams }) {
  const params = await searchParams
  const type = params?.type?.toUpperCase() ?? null
  const gender = params?.gender?.toUpperCase() ?? null

  const productFilter = {}
  if (type) productFilter.type = type
  if (gender) productFilter.gender = gender

  const hasFilter = type || gender

  const drops = await prisma.drop.findMany({
    include: {
      products: hasFilter ? { where: productFilter } : true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const filteredDrops = hasFilter
    ? drops.filter((d) => d.products.length > 0)
    : drops

  const pageTitle =
    type ? (PAGE_TITLES.type[type] ?? 'Drops') :
    gender ? (PAGE_TITLES.gender[gender] ?? 'Drops') :
    'All Products'

  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">All Releases</p>
        <h1 className="text-4xl font-bold tracking-tight">{pageTitle}</h1>
      </div>

      {filteredDrops.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrops.map((drop) => (
            <DropCard key={drop.id} drop={drop} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-sm text-zinc-600">No drops found.</p>
        </div>
      )}
    </div>
  )
}
