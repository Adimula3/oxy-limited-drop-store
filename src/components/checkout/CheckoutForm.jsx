'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { toast } from 'sonner'

export default function CheckoutForm({ orderId }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const [shipping, setShipping] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })

  function handleShipping(e) {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}`,
        shipping: {
          name: shipping.fullName,
          address: {
            line1: shipping.address1,
            line2: shipping.address2 || undefined,
            city: shipping.city,
            state: shipping.state,
            postal_code: shipping.postalCode,
            country: shipping.country,
          },
        },
      },
    })

    if (error) {
      toast.error(error.message || 'Payment failed. Please try again.')
      setProcessing(false)
    }
    // On success, Stripe redirects to return_url — no need to handle here
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none'

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Shipping address */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Shipping Address
        </h2>
        <div className="space-y-3">
          <input
            name="fullName"
            value={shipping.fullName}
            onChange={handleShipping}
            placeholder="Full name"
            required
            className={inputClass}
          />
          <input
            name="address1"
            value={shipping.address1}
            onChange={handleShipping}
            placeholder="Address line 1"
            required
            className={inputClass}
          />
          <input
            name="address2"
            value={shipping.address2}
            onChange={handleShipping}
            placeholder="Address line 2 (optional)"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="city"
              value={shipping.city}
              onChange={handleShipping}
              placeholder="City"
              required
              className={inputClass}
            />
            <input
              name="state"
              value={shipping.state}
              onChange={handleShipping}
              placeholder="State"
              required
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="postalCode"
              value={shipping.postalCode}
              onChange={handleShipping}
              placeholder="Postal code"
              required
              className={inputClass}
            />
            <input
              name="country"
              value={shipping.country}
              onChange={handleShipping}
              placeholder="Country"
              required
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Stripe payment */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Payment
        </h2>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full rounded-full bg-white py-4 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {processing ? 'Processing…' : 'Pay Now'}
      </button>
    </form>
  )
}
