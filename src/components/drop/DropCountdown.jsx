'use client'

import { useState, useEffect } from 'react'

function getTimeLeft(scheduledAt) {
  const diff = new Date(scheduledAt).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

function Unit({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold tabular-nums text-white">
        {String(value).padStart(2, '0')}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-zinc-600">{label}</p>
    </div>
  )
}

export default function DropCountdown({ scheduledAt, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(scheduledAt))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(scheduledAt)), 1000)
    return () => clearInterval(id)
  }, [scheduledAt])

  if (!timeLeft) {
    return (
      <p className={`text-xs font-medium uppercase tracking-widest text-green-400 ${className}`}>
        Live Now
      </p>
    )
  }

  const { d, h, m, s } = timeLeft
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {d > 0 && <Unit value={d} label="d" />}
      <Unit value={h} label="h" />
      <Unit value={m} label="m" />
      <Unit value={s} label="s" />
    </div>
  )
}
