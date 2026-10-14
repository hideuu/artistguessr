import { useEffect, useMemo, useState } from 'react'
import { dayNumber, getDailyArtist, parseDayKey, todayKey } from './lib/daily'
import { COLUMNS, compareArtists } from './lib/compare'
import { MAX_GUESSES, loadStats, recordResult  } from './lib/stats'
import StatsPanel from './components/StatsPanel'
import Countdown from './components/Countdown'
import HowToPlay from './components/HowToPlay'
import Archive from './components/Archive'


const CELL_STYLE = {
  green: 'bg-hit text-white',
  yellow: 'bg-near text-ink',
  red: 'bg-miss text-white',
}
const EMOJI = { green: '🟩', yellow: '🟨', red: '🟥' }
const GRID = {
  gridTemplateColumns: `repeat(${COLUMNS.length + 1}, minmax(90px, 1fr))`,
}

const MODE = 'artist'
// ?day=YYYY-MM-DD plays a past puzzle from the archive. Anything else is today.
const TODAY = todayKey()
const requested = parseDayKey(new URLSearchParams(window.location.search).get('day'))
const isPastPuzzle = requested && todayKey(requested) < TODAY && dayNumber(requested) >= 0
const PLAY_DATE = isPastPuzzle ? requested : new Date()
const PLAY_KEY = todayKey(PLAY_DATE)
const IS_ARCHIVE = PLAY_KEY !== TODAY
const PUZZLE_NUMBER = dayNumber(PLAY_DATE) + 1
const STORAGE_KEY = `artistguessr:${MODE}:${PLAY_KEY}`


export default function App() {
  const [artists, setArtists] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState(() => loadStats(MODE))
  const [showArchive, setShowArchive] = useState(false)
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
    () => (artists.length ? getDailyArtist(artists, PLAY_DATE) : null),
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
  const lost = !won && guessIds.length >= MAX_GUESSES
  const over = won || lost

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
    if (over) return
    const next = [...guessIds, artist.id]
    setGuessIds(next)
    setQuery('')
    const isWin = artist.id === answer.id
    if (!IS_ARCHIVE && (isWin || next.length >= MAX_GUESSES)) {
      setStats(recordResult(MODE, isWin, next.length))
    }
  }

  function copyResult() {
    const rows = guesses.map((g) =>
      compareArtists(g, answer)
        .map((cell) => EMOJI[cell.status])
        .join(''),
    )
    const score = won ? guesses.length : 'X'
    const text = `ArtistGuessr #${PUZZLE_NUMBER} ${score}/${MAX_GUESSES}\n\n${rows.join('\n')}`
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
        {IS_ARCHIVE ? 'Replaying an old puzzle.' : "Guess today's artist."} Each guess
        shows how close you are.
      </p>

      <nav className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="rounded-md bg-panel px-2.5 py-1 font-semibold">
          Puzzle #{PUZZLE_NUMBER} · {PLAY_KEY}
        </span>
        {IS_ARCHIVE && (
          <a href="/" className="text-near hover:underline">
            Back to today
          </a>
        )}
        <button
          onClick={() => setShowArchive(!showArchive)}
          className="text-near hover:underline"
        >
          {showArchive ? 'Hide archive' : 'Archive'}
        </button>
      </nav>

      {showArchive && (
        <Archive
          mode={MODE}
          answerFor={(key) => getDailyArtist(artists, parseDayKey(key))}
          maxGuesses={MAX_GUESSES}
          onClose={() => setShowArchive(false)}
        />
      )}


      <HowToPlay open={stats.played === 0 && guessIds.length === 0} />
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

      {over ? (
        <section
          className={`mt-8 rounded-xl border bg-panel p-5 ${won ? 'border-hit' : 'border-miss'}`}
        >
          <p className="text-2xl font-bold">
            {won ? `It's ${answer.name}.` : `Out of guesses. It was ${answer.name}.`}
          </p>
          <p className="mt-1 text-paper/80">
            {won
              ? `Solved in ${guesses.length} ${guesses.length === 1 ? 'guess' : 'guesses'}.`
              : IS_ARCHIVE
                ? 'Pick another day from the archive.'
                : 'Your streak resets. Try again tommorow.'}
          </p>
          <button
            onClick={copyResult}
            className="mt-4 rounded-lg bg-hit px-4 py-2 font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-near"
          >
            {copied ? 'Copied!' : 'Copy result'}
          </button>
          {IS_ARCHIVE ? (
            <p className="mt-3 text-paper/80">
              Archive games don't change your stats.{' '}
              <a href="/" className="text-near hover:underline">
                Play today's puzzle
              </a>
            </p>
          ) : (
            <>
              <Countdown />
              <StatsPanel stats={stats} highlight={won ? guesses.length : null} />
            </>
          )}
        </section>
      ) : (
        <div className="relative mt-8">
          <p className="mb-2 text-sm text-paper/70">
            Guess {guessIds.length + 1} of {MAX_GUESSES}
          </p>
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