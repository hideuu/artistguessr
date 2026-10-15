// Day 0 of the game. Do not change this after launch or every answer shifts.
const EPOCH = Date.UTC(2026, 9, 11) // Oct 11, 2026

// Local date as YYYY-MM-DD. The puzzle resets at the player's local midnight.
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Turns "YYYY-MM-DD" back into a local date. Returns null if it isn't valid.
export function parseDayKey(key) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key || '')
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return todayKey(date) === key ? date : null
}

export function dayNumber(date = new Date()) {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((local - EPOCH) / 86400000)
}

// Small seeded random generator, so everyone gets the same shuffle.
function mulberry32(seed) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Everyone gets the same artist on the same day, and no artist repeats
// until the whole list has been used once.
export function getDailyArtist(artists, date = new Date()) {
  const ids = artists.map((a) => a.id).sort() // sorted, so file order doesn't matter
  const random = mulberry32(20261011)

  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }

  const index = ((dayNumber(date) % ids.length) + ids.length) % ids.length
  return artists.find((a) => a.id === ids[index])
}
// Every past puzzle, newest first: [{ key, number }]. Puzzle #1 is the launch day.
export function pastDays(today = new Date()) {
  const days = []
  for (let n = dayNumber(today) - 1; n >= 0; n--) {
    const date = new Date(EPOCH + n * 86400000)
    const local = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    days.push({ key: todayKey(local), number: n + 1 })
  }
  return days
}
