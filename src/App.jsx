import { useEffect, useMemo, useState } from 'react'
import { dayNumber, getDailyArtist, parseDayKey, todayKey } from './lib/daily'
import { compareArtists } from './lib/compare'
import { MAX_GUESSES, loadStats, recordResult } from './lib/stats'
import { dayStatus, isFinished, loadGuesses } from './lib/progress'
import Archive from './components/Archive'
import Board from './components/Board'
import Footer from './components/Footer'
import GuessInput from './components/GuessInput'
import Header from './components/Header'
import HowToPlay from './components/HowToPlay'
import Landing from './components/Landing'
import Modal from './components/Modal'
import ResultsModal from './components/ResultsModal'

const EMOJI = { green: '🟩', yellow: '🟨', red: '🟥' }
const MODE = 'artist'

// ?day=YYYY-MM-DD plays a past puzzle from the archive. Anything else is today.
const TODAY = todayKey()
const requested = parseDayKey(new URLSearchParams(window.location.search).get('day'))
const isPastPuzzle =
  requested && todayKey(requested) < TODAY && dayNumber(requested) >= 0
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
  // Which page is showing: "landing", "game" or "archive". Archive links skip the landing.
  const [screen, setScreen] = useState(IS_ARCHIVE ? 'game' : 'landing')
  // Which pop-up is open: null, "help" or "stats".
  const [modal, setModal] = useState(null)
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

  // The archive unlocks once today's puzzle is finished (won or lost).
  const todayIds = IS_ARCHIVE ? loadGuesses(MODE, TODAY) : guessIds
  const todayAnswer = artists.length ? getDailyArtist(artists) : null
  const todayDone =
    Boolean(todayAnswer) && isFinished(dayStatus(todayIds, todayAnswer.id, MAX_GUESSES))

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
    // Archive games don't count toward stats or the streak.
    if (!IS_ARCHIVE && (isWin || next.length >= MAX_GUESSES)) {
      setStats(recordResult(MODE, isWin, next.length))
    }
    // Game over: show the results after a short pause so the last row is visible.
    if (isWin || next.length >= MAX_GUESSES) {
      setTimeout(() => setModal('stats'), 700)
    }
  }

  // Play button on the landing page. First-timers see the rules first.
  function play() {
    setScreen('game')
    if (stats.played === 0 && guessIds.length === 0) setModal('help')
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

  if (error) return <p className="p-6 text-crimson">{error}</p>
  if (!answer) return <p className="p-6 text-ash">Loading artists...</p>

  const playDate = PLAY_DATE.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const result = over ? { won, answer: answer.name, count: guesses.length } : null

  // Opened an archive link before finishing today: show the locked archive.
  const page = IS_ARCHIVE && !todayDone ? 'archive' : screen

  const modals = (
    <>
      {modal === 'help' && (
        <Modal title="How to play" onClose={() => setModal(null)}>
          <HowToPlay />
        </Modal>
      )}
      {modal === 'stats' && (
        <ResultsModal
          result={result}
          stats={stats}
          isArchive={IS_ARCHIVE}
          copied={copied}
          onShare={copyResult}
          onArchive={() => {
            setModal(null)
            setScreen('archive')
          }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )

  if (page === 'landing') {
    return (
      <>
        <Landing
          puzzleNumber={PUZZLE_NUMBER}
          playLabel={over ? 'See results' : guessIds.length ? 'Continue' : 'Play'}
          onPlay={play}
          onArchive={() => setScreen('archive')}
          onHelp={() => setModal('help')}
        />
        {modals}
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        onHome={() => (IS_ARCHIVE ? (window.location.href = '/') : setScreen('landing'))}
        onHelp={() => setModal('help')}
        onArchive={() => setScreen('archive')}
        onStats={() => setModal('stats')}
      />

      <div className="flex-1">
        {page === 'archive' ? (
          <Archive
            mode={MODE}
            answerFor={(date) => getDailyArtist(artists, date)}
            maxGuesses={MAX_GUESSES}
            unlocked={todayDone}
          />
        ) : (
          <main className="mx-auto max-w-[800px] px-4 py-6">
            {/* Info row: puzzle number, date, guesses used */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3 text-sm">
              <span>
                <b>No. {PUZZLE_NUMBER}</b> · {playDate}
                {IS_ARCHIVE && (
                  <a href="/" className="ml-3 font-semibold text-crimson hover:underline">
                    Back to today
                  </a>
                )}
              </span>
              <span className="flex items-center gap-3">
                Guess {Math.min(guessIds.length + 1, MAX_GUESSES)} of {MAX_GUESSES}
                <span className="flex gap-1" aria-hidden="true">
                  {Array.from({ length: MAX_GUESSES }, (_, i) => (
                    <span
                      key={i}
                      className={`size-2.5 rounded-full ${i < guessIds.length ? 'bg-crimson' : 'border border-hairline'}`}
                    />
                  ))}
                </span>
              </span>
            </div>

            <h1 className="mt-8 font-display text-4xl font-black sm:text-5xl">
              {IS_ARCHIVE ? 'Who was the artist?' : "Who's today's artist?"}
            </h1>
            <p className="mt-2 mb-5 text-ash">
              Pick an artist. Each guess shows how close you are on 9 clues.
            </p>

            {over ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-parchment px-4 py-3">
                <p className="font-semibold">
                  {won ? `You got it: ${answer.name}.` : `It was ${answer.name}.`}
                </p>
                <button
                  onClick={() => setModal('stats')}
                  className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-bone hover:brightness-125"
                >
                  See results
                </button>
              </div>
            ) : (
              <GuessInput
                query={query}
                setQuery={setQuery}
                suggestions={suggestions}
                onGuess={submitGuess}
              />
            )}

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-match" />Match</li>
              <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-close" />Close</li>
              <li className="flex items-center gap-1.5"><span className="size-3 rounded-sm bg-miss" />No match</li>
              <li className="text-ash">↑↓ point toward the answer</li>
            </ul>

            <Board guesses={guesses} answer={answer} />
          </main>
        )}
      </div>

      <Footer />
      {modals}
    </div>
  )
}
