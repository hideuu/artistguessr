import { useEffect, useMemo, useState } from 'react'
import { getDailyArtist, todayKey } from './lib/daily'
import { COLUMNS, compareArtists } from './lib/compare'

const CELL_STYLE = {
  green: 'bg-hit text-white',
  yellow: 'bg-near text-ink',
  red: 'bg-miss text-white',
}
const EMOJI = { green: '🟩', yellow: '🟨', red: '🟥' }
const GRID = {
  gridTemplateColumns: `repeat(${COLUMNS.length + 1}, minmax(90px, 1fr))`,
}
const STORAGE_KEY = `artistguessr:artist:${todayKey()}`

export default function App() {
  const [artists, setArtists] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [guessIds, setGuessIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  // Load the artist data.
  useEffect(() => {
    fetch('/data/artists.json')
      .then((res) => {
        if (!res.ok) throw new Error('bad response')
        return res.json()
      })
      .then(setArtists)
      .catch(() =>
        setError("Couldn't load artists. Check that public/data/artists.json exists."),
      )
  }, [])

  // Remember today's guesses so a refresh doesn't reset the game.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guessIds))
    } catch {
      // Storage can be blocked. The game still works without it.
    }
  }, [guessIds])

  const answer = useMemo(
    () => (artists.length ? getDailyArtist(artists) : null),
    [artists],
  )

  // While testing, the answer is printed in the browser console.
  useEffect(() => {
    if (import.meta.env.DEV && answer) console.log('Answer:', answer.name)
  }, [answer])

  const guesses = guessIds
    .map((id) => artists.find((a) => a.id === id))
    .filter(Boolean)
  const won = Boolean(answer) && guessIds.includes(answer.id)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return artists
      .filter((a) => !guessIds.includes(a.id))
      .filter((a) =>
        [a.name, ...(a.aliases || [])].some((n) => n.toLowerCase().includes(q)),
      )
      .slice(0, 6)
  }, [query, artists, guessIds])

  function submitGuess(artist) {
    setGuessIds([...guessIds, artist.id])
    setQuery('')
  }

  function copyResult() {
    const rows = guesses.map((g) =>
      compareArtists(g, answer)
        .map((cell) => EMOJI[cell.status])
        .join(''),
    )
    const text = `ArtistGuessr ${todayKey()}\n${guesses.length} guesses\n\n${rows.join('\n')}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (error) return <p className="p-6 text-near">{error}</p>
  if (!answer) return <p className="p-6 text-paper/70">Loading artists...</p>

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-5xl font-extrabold tracking-tight">ArtistGuessr</h1>
      <p className="mt-2 max-w-md text-paper/70">
        Guess today's artist. Each guess shows how close you are.
      </p>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-paper/80">
        <li>
          <span className="mr-1.5 inline-block size-3 rounded-sm bg-hit align-middle" />
          Match
        </li>
        <li>
          <span className="mr-1.5 inline-block size-3 rounded-sm bg-near align-middle" />
          Close
        </li>
        <li>
          <span className="mr-1.5 inline-block size-3 rounded-sm bg-miss align-middle" />
          No match
        </li>
        <li>Arrows point toward the answer</li>
      </ul>

      {won ? (
        <section className="mt-8 rounded-xl border border-hit bg-panel p-5">
          <p className="text-2xl font-bold">It's {answer.name}.</p>
          <p className="mt-1 text-paper/80">
            Solved in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}.
          </p>
          <button
            onClick={copyResult}
            className="mt-4 rounded-lg bg-hit px-4 py-2 font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-near"
          >
            {copied ? 'Copied!' : 'Copy result'}
          </button>
        </section>
      ) : (
        <div className="relative mt-8">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && suggestions[0]) submitGuess(suggestions[0])
            }}
            placeholder="Type an artist name"
            aria-label="Artist name"
            className="w-full rounded-xl border border-line bg-panel px-4 py-3 text-lg text-paper outline-none placeholder:text-paper/50 focus-visible:border-near focus-visible:ring-2 focus-visible:ring-near"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-panel shadow-lg">
              {suggestions.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => submitGuess(a)}
                    className="w-full px-4 py-2.5 text-left hover:bg-line focus-visible:bg-line focus-visible:outline-none"
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 overflow-x-auto pb-4">
        <div className="min-w-[900px]">
          <div
            className="grid gap-1 text-center text-sm text-paper/70"
            style={GRID}
          >
            <div>Artist</div>
            {COLUMNS.map((c) => (
              <div key={c.key}>{c.label}</div>
            ))}
          </div>

          {guesses.length === 0 && (
            <p className="mt-3 text-paper/60">Your guesses will appear here.</p>
          )}

          {[...guesses].reverse().map((g) => (
            <div key={g.id} className="mt-1 grid gap-1" style={GRID}>
              <div className="flex items-center justify-center rounded-md bg-panel p-2 text-center text-sm font-semibold">
                {g.name}
              </div>
              {compareArtists(g, answer).map((cell) => (
                <div
                  key={cell.key}
                  className={`flex flex-col items-center justify-center rounded-md p-2 text-center text-sm ${CELL_STYLE[cell.status]}`}
                >
                  <span>{cell.text}</span>
                  {cell.hint && (
                    <span className="text-lg leading-none">{cell.hint}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}