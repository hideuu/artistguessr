import { MAX_GUESSES } from '../lib/stats'

// Open by default for first-time players.
export default function HowToPlay({ open }) {
  return (
    <details open={open} className="mt-6 rounded-xl border border-line bg-panel p-4">
      <summary className="cursor-pointer font-semibold">How to play</summary>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-paper/80">
        <li>Guess today's artist in {MAX_GUESSES} tries.</li>
        <li>Type a name and pick an artist from the list.</li>
        <li>
          Each clue turns <span className="font-semibold text-hit">green</span> for a
          match, <span className="font-semibold text-near">yellow</span> when close,
          and <span className="font-semibold text-miss">red</span> for no match.
        </li>
        <li>Genres are yellow when at least one genre is shared.</li>
        <li>Debut is yellow within 2 years. Arrows point toward the answer.</li>
        <li>A new artist drops every day at midnight.</li>
      </ul>
    </details>
  )
}