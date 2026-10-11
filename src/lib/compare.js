const TIERS = ['low', 'medium', 'high', 'very_high']

export const COLUMNS = [
  { key: 'country', label: 'Country' },
  { key: 'genres', label: 'Genres' },
  { key: 'debut_year', label: 'Debut' },
  { key: 'artist_type', label: 'Type' },
  { key: 'group_size', label: 'Members' },
  { key: 'gender', label: 'Gender' },
  { key: 'listener_tier', label: 'Listeners' },
  { key: 'album_count', label: 'Albums' },
  { key: 'status', label: 'Status' },
]

// Arrow points toward the answer.
function arrow(guess, answer) {
  if (answer > guess) return '↑'
  if (answer < guess) return '↓'
  return ''
}

function show(value) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value).replaceAll('_', ' ')
}

// Returns one cell per column: { key, text, status, hint }
// status is "green" (match), "yellow" (close) or "red" (no match).
export function compareArtists(guess, answer) {
  return COLUMNS.map(({ key }) => {
    const g = guess[key]
    const a = answer[key]
    let status = 'red'
    let hint = ''
    let text = show(g)

    if (key === 'genres') {
      text = g.length ? g.join(', ') : '—'
      const shared = g.filter((genre) => a.includes(genre))
      if (g.length === a.length && shared.length === a.length) {
        status = 'green'
      } else if (shared.length > 0) {
        status = 'yellow'
      }
    } else if (key === 'listener_tier') {
      const gi = TIERS.indexOf(g)
      const ai = TIERS.indexOf(a)
      if (gi === ai) {
        status = 'green'
      } else {
        status = Math.abs(gi - ai) === 1 ? 'yellow' : 'red'
        hint = arrow(gi, ai)
      }
    } else if (['debut_year', 'album_count', 'group_size'].includes(key)) {
      if (g === a) {
        status = 'green'
      } else if (g !== null && a !== null) {
        hint = arrow(g, a)
        // Debut within 2 years counts as close.
        if (key === 'debut_year' && Math.abs(g - a) <= 2) status = 'yellow'
      }
    } else if (g === a) {
      status = 'green'
    }

    return { key, text, status, hint }
  })
}