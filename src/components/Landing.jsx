import { Logo } from './Icon'

const PILL = 'w-44 rounded-full px-6 py-3 font-semibold transition hover:brightness-110'

// The red splash page you see before playing today's puzzle.
export default function Landing({ puzzleNumber, playLabel, onPlay, onArchive, onHelp }) {
  const date = new Date().toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-crimson px-6 text-center text-bone">
      <Logo size={72} />
      <h1 className="mt-6 font-display text-5xl font-black tracking-tight sm:text-7xl">
        ArtistGuessr
      </h1>
      <p className="mt-3 text-xl sm:text-2xl">Guess the artist in 8 tries.</p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button onClick={onPlay} className={`${PILL} bg-ink text-bone`}>
          {playLabel}
        </button>
        <button onClick={onArchive} className={`${PILL} border-2 border-bone/80`}>
          Archive
        </button>
        <button onClick={onHelp} className={`${PILL} border-2 border-bone/80`}>
          How to play
        </button>
      </div>

      <p className="mt-10 font-semibold">{date}</p>
      <p className="text-sm">No. {puzzleNumber}</p>
      <p className="text-sm opacity-80">Edited by Hideu</p>
    </main>
  )
}
