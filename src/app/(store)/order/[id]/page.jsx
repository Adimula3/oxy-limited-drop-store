import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export const metadata = { title: 'Order Confirmed — OxY' }

export default async function OrderConfirmationPage({ params }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: { drop: { select: { id: true, name: true } } },
          },
        },
      },
    },
  })

  if (!order) notFound()

  // Guard: only the owner or admin can view
  if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/store')
  }

  const shipping = order.shippingAddress ? JSON.parse(order.shippingAddress) : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      {/* Success header */}
      <div className="mb-12 text-center">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-2xl text-green-400">
            ✓
          </div>
        </div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
          {order.status === 'PAID' ? 'Payment Successful' : 'Order Received'}
        </p>
        <h1 className="mb-3 text-3xl font-bold">Order Confirmed</h1>
        <p className="text-sm text-zinc-500">
          Order ID:{' '}
          <span className="font-mono text-zinc-300">#{order.id.slice(-8).toUpperCase()}</span>
        </p>
      </div>

      {/* Items */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Items
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{item.product.name}</p>
                <p className="text-xs text-zinc-500">{item.product.drop.name}</p>
                {item.product.sku && (
                  <p className="text-xs text-zinc-600">SKU: {item.product.sku}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">
                  ${(item.price / 100).toFixed(2)}
                </p>
                <p className="text-xs text-zinc-600">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold text-white">Total</span>
            <span className="font-bold text-white">${(order.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {shipping && (
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Shipping To
          </h2>
          <p className="text-sm leading-relaxed text-zinc-300">
            {shipping.fullName}
            <br />
            {shipping.address1}
            {shipping.address2 && <>, {shipping.address2}</>}
            <br />
            {shipping.city}, {shipping.state} {shipping.postalCode}
            <br />
            {shipping.country}
          </p>
        </div>
      )}

      {/* Links */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/account/orders"
          className="flex-1 rounded-full border border-zinc-700 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-zinc-500"
        >
          View All Orders
        </Link>
        <Link
          href="/store"
          className="flex-1 rounded-full bg-white py-3 text-center text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
