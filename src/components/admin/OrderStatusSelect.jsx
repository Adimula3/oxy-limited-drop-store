'use client'

import { useState } from 'react'

const STATUS_STYLES = {
  PENDING: 'bg-zinc-800 text-zinc-300',
  PAID: 'bg-green-950 text-green-400',
  FAILED: 'bg-red-950 text-red-400',
  REFUNDED: 'bg-amber-950 text-amber-400',
}

const STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']

export default function OrderStatusSelect({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function handleChange(e) {
    const newStatus = e.target.value
    setSaving(true)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setStatus(newStatus)
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={saving}
      className={`cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 text-xs font-medium uppercase tracking-wider outline-none transition-opacity disabled:opacity-50 ${STATUS_STYLES[status]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-zinc-900 text-white normal-case">
          {s}
        </option>
      ))}
    </select>
  )
}
