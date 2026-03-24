import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import redis from '@/lib/redis'
import { randomUUID } from 'crypto'

export async function POST(req, { params }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: dropId } = await params
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    // Check drop exists and is LIVE
    const drop = await prisma.drop.findUnique({
      where: { id: dropId },
      include: { products: { where: { id: productId } } },
    })

    if (!drop) {
      return NextResponse.json({ error: 'Drop not found' }, { status: 404 })
    }
    if (drop.status !== 'LIVE') {
      return NextResponse.json({ error: 'Drop is not live' }, { status: 400 })
    }

    const product = drop.products[0]
    if (!product) {
      return NextResponse.json({ error: 'Product not found in this drop' }, { status: 404 })
    }

    // Check user hasn't already purchased this drop
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: 'PAID',
        items: { some: { product: { dropId } } },
      },
    })
    console.log('[reserve] existingOrder:', existingOrder)
    if (existingOrder) {
      return NextResponse.json({ error: 'You have already purchased this drop' }, { status: 409 })
    }

    // Self-heal: seed Redis stock key from DB if it doesn't exist.
    // This handles: key never seeded, key evicted, or cold-start scenarios.
    // SETNX is atomic — safe under concurrent requests.
    const stockKey = `stock:product:${productId}`
    const actualRemaining = Math.max(0, product.stock - product.sold)
    await redis.setnx(stockKey, actualRemaining)

    // Atomic decrement
    const remaining = await redis.decr(stockKey)

    if (remaining < 0) {
      // Restore the counter and report out of stock
      await redis.incr(stockKey)
      return NextResponse.json({ error: 'Out of stock' }, { status: 409 })
    }
       console.log('[reserve] Redis remaining after decr:', remaining)
    // Create reservation token (expires in 10 minutes)
    const token = randomUUID()
    await redis.set(
      `reservation:${token}`,
      JSON.stringify({
        userId: session.user.id,
        productId,
        dropId,
        quantity: 1,
      }),
      { ex: 600 }
    )

    return NextResponse.json({ reservationToken: token, expiresIn: 600 })
  } catch (err) {
    console.error('[POST /api/drops/[id]/reserve]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Release a reservation explicitly — called when checkout timer expires or user navigates away.
// Restores the Redis stock counter so the unit is available to the next buyer.
export async function DELETE(req, { params }) {
  try {
    const { reservationToken } = await req.json()
    if (!reservationToken) return NextResponse.json({ ok: true })

    const raw = await redis.get(`reservation:${reservationToken}`)
    if (!raw) {
      // Token already expired or doesn't exist — nothing to restore
      return NextResponse.json({ ok: true })
    }

    const { productId } = typeof raw === 'string' ? JSON.parse(raw) : raw

    await Promise.all([
      redis.del(`reservation:${reservationToken}`),
      redis.incr(`stock:product:${productId}`),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/drops/[id]/reserve]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
