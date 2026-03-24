'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function BuyButton({ dropId, products, isLive, totalStock, dropStatus }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [outOfStock, setOutOfStock] = useState(false)

  // Pick the first product with available stock (single-product drops use index 0)
  const availableProduct = products.find((p) => p.stock > 0) ?? products[0]

  function buttonLabel() {
    if (dropStatus === 'UPCOMING') return 'Drop Not Live Yet'
    if (dropStatus === 'ENDED') return 'Drop Ended'
    if (dropStatus === 'SOLD_OUT' || totalStock === 0 || outOfStock) return 'Sold Out'
    return 'Buy Now'
  }

  const disabled = !isLive || totalStock === 0 || outOfStock || loading || dropStatus === 'SOLD_OUT'

  async function handleBuy() {
    if (!availableProduct) return
    setLoading(true)

    try {
      const res = await fetch(`/api/drops/${dropId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: availableProduct.id }),
      })

      const data = await res.json()

      if (res.status === 401) {
        // Not logged in — send to login then back here
        window.location.href = `/login?callbackUrl=/drops/${dropId}`
        return
      }

      if (res.status === 409) {
        setOutOfStock(true)
        toast.error('Out of stock — someone just grabbed the last one.')
        return
      }

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong. Please try again.')
        return
      }

      // Navigate to checkout with reservation token
      router.push(
        `/checkout?reservationToken=${data.reservationToken}&dropId=${dropId}&productId=${availableProduct.id}`
      )
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={disabled}
      className="w-full rounded-full bg-white py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {loading ? 'Reserving…' : buttonLabel()}
    </button>
  )
}
