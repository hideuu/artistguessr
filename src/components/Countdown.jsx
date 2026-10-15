import { useEffect, useState } from 'react'

function msUntilMidnight() {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight - now
}

function format(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

// Counts down to the player's local midnight, then reloads for the new puzzle.
export default function Countdown() {
  const [left, setLeft] = useState(msUntilMidnight)

  useEffect(() => {
    const timer = setInterval(() => {
      const ms = msUntilMidnight()
      setLeft(ms)
      if (ms < 1000) window.location.reload()
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <p className="text-sm">
      Next artist in{' '}
      <span className="font-bold tabular-nums">{format(left)}</span>
    </p>
  )
}
