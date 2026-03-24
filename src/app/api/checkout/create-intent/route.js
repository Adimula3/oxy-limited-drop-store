import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import redis from '@/lib/redis'
import stripe from '@/lib/stripe'

export async function POST(req) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reservationToken, shippingAddress } = await req.json()

    if (!reservationToken) {
      return NextResponse.json({ error: 'reservationToken is required' }, { status: 400 })
    }

    // Validate reservation exists
    const raw = await redis.get(`reservation:${reservationToken}`)
    if (!raw) {
      return NextResponse.json({ error: 'Reservation expired or not found' }, { status: 410 })
    }

    const reservation = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: reservation.productId },
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create Order in PENDING state so we can get an orderId for the return_url
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: product.price * reservation.quantity,
        status: 'PENDING',
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
        items: {
          create: {
            productId: reservation.productId,
            quantity: reservation.quantity,
            price: product.price,
          },
        },
      },
    })

    // Create Stripe PaymentIntent
    const intent = await stripe.paymentIntents.create({
      amount: product.price * reservation.quantity,
      currency: 'usd',
      metadata: {
        reservationToken,
        userId: session.user.id,
        productId: reservation.productId,
        dropId: reservation.dropId,
        orderId: order.id,
      },
    })

    // Save paymentIntentId on the order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: intent.id },
    })

    return NextResponse.json({ clientSecret: intent.client_secret, orderId: order.id })
  } catch (err) {
    console.error('[POST /api/checkout/create-intent]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
