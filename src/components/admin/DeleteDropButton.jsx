'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteDropButton({ id, name, status }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status !== 'UPCOMING') return null

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setLoading(true)
    const res = await fetch(`/api/drops/${id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'Failed to delete')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-zinc-600 transition-colors hover:text-red-500 disabled:opacity-40"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
