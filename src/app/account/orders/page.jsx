import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export const metadata = { title: 'My Orders — OxY' }

const STATUS_STYLES = {
  PENDING: 'bg-zinc-800 text-zinc-400',
  PAID: 'bg-green-950 text-green-400',
  FAILED: 'bg-red-950 text-red-400',
  REFUNDED: 'bg-zinc-800 text-zinc-400',
}

export default async function AccountOrdersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: { drop: { select: { id: true, name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold tracking-tight">Order History</h2>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="mb-4 text-zinc-500">No orders yet.</p>
          <Link
            href="/drops"
            className="text-sm underline underline-offset-4 transition-colors hover:text-zinc-300"
          >
            Browse drops
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">
                  #{order.id.slice(-8).toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mb-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-zinc-300">
                      {item.product.name}
                      <span className="ml-2 text-zinc-600">× {item.quantity}</span>
                    </span>
                    <span className="text-zinc-400">${(item.price / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between border-t border-zinc-800 pt-3">
                <span className="text-xs text-zinc-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span className="font-semibold text-white">
                  ${(order.total / 100).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
