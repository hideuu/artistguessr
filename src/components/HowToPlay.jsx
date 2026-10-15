import { Tile } from './Board'
import { MAX_GUESSES } from '../lib/stats'

// Example rows for the rules. Same shape compare.js returns.
const EXAMPLES = [
  {
    cell: { key: 'country', text: 'CA', status: 'green' },
    label: 'Country',
    note: 'Green means a match. The answer is from Canada too.',
  },
  {
    cell: { key: 'debut_year', text: '2011', status: 'yellow', hint: '↑' },
    label: 'Debut',
    note: 'Yellow means close. The debut is within 2 years, and the arrow says later.',
  },
  {
    cell: { key: 'genres', text: 'rock', status: 'red' },
    label: 'Genres',
    note: 'Grey means no match. No genre in common.',
  },
]

export default function HowToPlay() {
  return (
    <div>
      <h2 className="font-display text-3xl font-black">How To Play</h2>
      <p className="mt-1 text-lg">Guess the artist in {MAX_GUESSES} tries.</p>
      <ul className="mt-4 list-disc space-y-1 pl-5">
        <li>Type a name and pick an artist from the list.</li>
        <li>Each guess shows 9 clues comparing it to the answer.</li>
        <li>Genres are yellow when at least one genre is shared.</li>
        <li>Arrows point toward the answer for years, members, listeners and albums.</li>
      </ul>

      <h3 className="mt-6 font-bold">Examples</h3>
      <ul className="mt-3 space-y-3">
        {EXAMPLES.map((ex) => (
          <li key={ex.label} className="flex items-center gap-3">
            <div className="w-20 shrink-0">
              <Tile cell={ex.cell} label={ex.label} />
            </div>
            <p className="text-sm">{ex.note}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-hairline pt-4 text-sm text-ash">
        A new artist drops every day at midnight.
      </p>
    </div>
  )
}
