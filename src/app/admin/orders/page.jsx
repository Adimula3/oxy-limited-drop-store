import prisma from '@/lib/db'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'

export const metadata = { title: 'Orders — Admin' }

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { email: true, name: true } },
      items: {
        include: {
          product: {
            include: { drop: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-16 text-center">
          <p className="text-sm text-zinc-600">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Order</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Customer</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500 sm:table-cell">Items</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Total</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500">Status</th>
                <th className="hidden px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-500 md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                  <td className="px-4 py-4 font-mono text-xs text-zinc-500">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{order.user.name ?? '—'}</p>
                    <p className="text-xs text-zinc-500">{order.user.email}</p>
                  </td>
                  <td className="hidden px-4 py-4 sm:table-cell">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-xs text-zinc-400">
                        {item.product.drop.name} — {item.product.name} × {item.quantity}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-4 font-medium text-white">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="hidden px-4 py-4 text-zinc-400 md:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
