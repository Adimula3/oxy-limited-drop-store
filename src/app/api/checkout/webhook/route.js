import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import redis from '@/lib/redis'
import stripe from '@/lib/stripe'
import { sendOrderConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object
      const { reservationToken, orderId, productId, dropId } = intent.metadata

      // Update order to PAID
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      })

      // Increment product.sold
      await prisma.product.update({
        where: { id: productId },
        data: { sold: { increment: 1 } },
      })

      // Delete reservation
      if (reservationToken) {
        await redis.del(`reservation:${reservationToken}`)
      }

      // Check if all products in the drop are sold out — update drop status if so
      const products = await prisma.product.findMany({
        where: { dropId },
      })
      const allSoldOut = products.every((p) => {
        const remaining = p.stock - p.sold
        return remaining <= 0
      })
      if (allSoldOut) {
        await prisma.drop.update({
          where: { id: dropId },
          data: { status: 'SOLD_OUT' },
        })
      }

      // Send order confirmation email (non-fatal)
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: { select: { email: true, name: true } },
            items: { include: { product: { select: { name: true } } } },
          },
        })
        if (fullOrder) await sendOrderConfirmation(fullOrder)
      } catch (emailErr) {
        console.error('[webhook] email send failed:', emailErr)
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object
      const { reservationToken, productId, orderId } = intent.metadata

      // Update order to FAILED
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'FAILED' },
        })
      }

      // Restore Redis stock
      if (productId) {
        await redis.incr(`stock:product:${productId}`)
      }

      // Delete reservation
      if (reservationToken) {
        await redis.del(`reservation:${reservationToken}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
