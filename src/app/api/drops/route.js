import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')?.toUpperCase()
    const gender = searchParams.get('gender')?.toUpperCase()
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
    const page = Math.max(parseInt(searchParams.get('page') ?? '1'), 1)
    const skip = (page - 1) * limit

    const productFilter = {}
    if (type) productFilter.type = type
    if (gender) productFilter.gender = gender
    const hasFilter = type || gender

    const [drops, total] = await Promise.all([
      prisma.drop.findMany({
        include: {
          products: hasFilter ? { where: productFilter } : true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.drop.count(),
    ])

    return NextResponse.json({ drops, total, page, limit })
  } catch (err) {
    console.error('[GET /api/drops]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { products = [], ...dropData } = body

    if (!dropData.name || !dropData.slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    if (products.length === 0) {
      return NextResponse.json({ error: 'At least one product is required' }, { status: 400 })
    }

    const drop = await prisma.$transaction(async (tx) => {
      return tx.drop.create({
        data: {
          name: dropData.name,
          slug: dropData.slug,
          description: dropData.description ?? null,
          coverImage: dropData.coverImage ?? null,
          scheduledAt: dropData.scheduledAt ? new Date(dropData.scheduledAt) : null,
          endsAt: dropData.endsAt ? new Date(dropData.endsAt) : null,
          maxPerUser: parseInt(dropData.maxPerUser ?? 1),
          status: dropData.status ?? 'UPCOMING',
          products: {
            create: products.map((p) => ({
              name: p.name,
              price: Math.round(parseFloat(p.price) * 100),
              stock: parseInt(p.stock ?? 0),
              sku: p.sku || null,
              image: p.image || null,
              gender: p.gender || 'UNISEX',
              type: p.type || 'APPAREL',
            })),
          },
        },
        include: { products: true },
      })
    }, {
      timeout: 15000,
      maxWait: 10000,
    })

    return NextResponse.json(drop, { status: 201 })
  } catch (err) {
    console.error('[POST /api/drops]', err)
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A drop with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
