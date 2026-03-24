'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StripeWrapper from '@/components/checkout/StripeWrapper'
import CheckoutForm from '@/components/checkout/CheckoutForm'

function Countdown({ seconds, reservationToken, dropId }) {
  const [remaining, setRemaining] = useState(seconds)
  const releasedRef = useRef(false)

  function releaseReservation() {
    if (releasedRef.current || !reservationToken || !dropId) return
    releasedRef.current = true
    // keepalive: true ensures this completes even if the page is unloading
    fetch(`/api/drops/${dropId}/reserve`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationToken }),
      keepalive: true,
    }).catch(() => {})
  }

  // Release stock if user navigates away or closes the tab
  useEffect(() => {
    window.addEventListener('beforeunload', releaseReservation)
    return () => window.removeEventListener('beforeunload', releaseReservation)
  }, [reservationToken, dropId])

  useEffect(() => {
    if (remaining <= 0) {
      releaseReservation()
      return
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining])

  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const expired = remaining <= 0

  return (
    <p className={`text-sm ${expired ? 'text-red-400' : 'text-zinc-400'}`}>
      {expired
        ? 'Reservation expired — please go back and try again.'
        : `Reservation expires in ${m}:${String(s).padStart(2, '0')}`}
    </p>
  )
}

function CheckoutInner() {
  const searchParams = useSearchParams()
  const reservationToken = searchParams.get('reservationToken')
  const dropId = searchParams.get('dropId')

  const [state, setState] = useState({ loading: true, error: null, clientSecret: null, orderId: null })
  const calledRef = useRef(false)

  useEffect(() => {
    if (!reservationToken || calledRef.current) return
    calledRef.current = true

    async function fetchIntent() {
      try {
        const res = await fetch('/api/checkout/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reservationToken }),
        })
        const data = await res.json()
        if (!res.ok) {
          setState({ loading: false, error: data.error || 'Failed to start checkout', clientSecret: null, orderId: null })
          return
        }
        setState({ loading: false, error: null, clientSecret: data.clientSecret, orderId: data.orderId })
      } catch {
        setState({ loading: false, error: 'Network error. Please try again.', clientSecret: null, orderId: null })
      }
    }

    fetchIntent()
  }, [reservationToken])

  if (!reservationToken) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="mb-4 text-zinc-400">No reservation found.</p>
        {dropId && (
          <Link href={`/drops/${dropId}`} className="text-sm underline underline-offset-4">
            Back to drop
          </Link>
        )}
      </div>
    )
  }

  if (state.loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="text-zinc-500">Preparing checkout…</p>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="mb-4 text-red-400">{state.error}</p>
        {dropId && (
          <Link href={`/drops/${dropId}`} className="text-sm underline underline-offset-4">
            Back to drop
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <Countdown seconds={600} reservationToken={reservationToken} dropId={dropId} />
      </div>

      {state.clientSecret && (
        <StripeWrapper clientSecret={state.clientSecret}>
          <CheckoutForm orderId={state.orderId} />
        </StripeWrapper>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="text-zinc-500">Loading…</p>
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  )
}
