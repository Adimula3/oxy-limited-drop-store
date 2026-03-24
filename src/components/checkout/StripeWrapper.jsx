'use client'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#ffffff',
    colorBackground: '#18181b',
    colorText: '#ffffff',
    colorDanger: '#f87171',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    borderRadius: '8px',
  },
}

export default function StripeWrapper({ clientSecret, children }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      {children}
    </Elements>
  )
}
