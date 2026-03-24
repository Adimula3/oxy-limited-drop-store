import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import redis from '@/lib/redis'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')?.toUpperCase()
    const gender = searchParams.get('gender')?.toUpperCase()

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
    if (!drop) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(drop)
  } catch (err) {
    console.error('[GET /api/drops/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { products, ...dropData } = body

    const drop = await prisma.$transaction(async (tx) => {
      await tx.drop.update({
        where: { id },
        data: {
          ...(dropData.name && { name: dropData.name }),
          ...(dropData.slug && { slug: dropData.slug }),
          description: dropData.description ?? null,
          coverImage: dropData.coverImage ?? null,
          scheduledAt: dropData.scheduledAt ? new Date(dropData.scheduledAt) : null,
          endsAt: dropData.endsAt ? new Date(dropData.endsAt) : null,
          maxPerUser: parseInt(dropData.maxPerUser ?? 1),
          ...(dropData.status && { status: dropData.status }),
        },
      })

      if (products) {
        const submittedIds = products.filter((p) => p.id).map((p) => p.id)

        // Delete products that were removed from the form (no orders on them)
        const existing = await tx.product.findMany({
          where: { dropId: id },
          include: { _count: { select: { orderItems: true } } },
        })
        const toDelete = existing.filter(
          (p) => !submittedIds.includes(p.id) && p._count.orderItems === 0
        )
        if (toDelete.length) {
          await tx.product.deleteMany({ where: { id: { in: toDelete.map((p) => p.id) } } })
        }

        // Update existing products in place / create new ones
        for (const p of products) {
          const data = {
            name: p.name,
            price: Math.round(parseFloat(p.price) * 100),
            stock: parseInt(p.stock ?? 0),
            sku: p.sku || null,
            image: p.image || null,
            gender: p.gender || 'UNISEX',
            type: p.type || 'APPAREL',
          }
          if (p.id) {
            await tx.product.update({ where: { id: p.id }, data })
          } else {
            await tx.product.create({ data: { ...data, dropId: id } })
          }
        }
      }

      return tx.drop.findUnique({ where: { id }, include: { products: true } })
    })

    // Seed Redis stock counters when drop goes LIVE
    if (dropData.status === 'LIVE' && drop.products.length > 0) {
      await Promise.all(
        drop.products.map((p) =>
          redis.set(`stock:product:${p.id}`, Math.max(0, p.stock - p.sold))
        )
      )
    }

    return NextResponse.json(drop)
  } catch (err) {
    console.error('[PATCH /api/drops/[id]]', err)
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A drop with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const drop = await prisma.drop.findUnique({ where: { id } })
    if (!drop) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (drop.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Only UPCOMING drops can be deleted' },
        { status: 400 },
      )
    }

    await prisma.drop.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/drops/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
