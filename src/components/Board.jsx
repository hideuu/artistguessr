import { COLUMNS, compareArtists } from '../lib/compare'
import Icon from './Icon'

// compare.js says green / yellow / red. These are the colors we show for each.
const TILE_STYLE = {
  green: 'bg-match text-bone',
  yellow: 'bg-close text-ink',
  red: 'bg-miss text-bone',
}

// Phones: 5 tiles per row and the name on its own line.
// Desktop: one row per guess, name cell first.
const ROW = 'grid grid-cols-5 gap-1 md:grid-cols-[110px_repeat(9,minmax(0,1fr))]'

export function Tile({ cell, label }) {
  return (
    <div
      className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-sm px-1 py-2 text-center ${TILE_STYLE[cell.status]}`}
    >
      <Icon name={cell.key} size={16} className="opacity-80" />
      <span className="line-clamp-2 text-xs font-semibold leading-tight capitalize">
        {cell.text}
        {cell.hint && <span className="ml-0.5 text-sm">{cell.hint}</span>}
      </span>
      {/* Column names sit above the board on desktop, so only phones need them here. */}
      <span className="text-[10px] uppercase tracking-wide opacity-75 md:hidden">
        {label}
      </span>
    </div>
  )
}

export default function Board({ guesses, answer }) {
  return (
    <section className="mt-8">
      <div className={`${ROW} hidden text-center text-[11px] font-bold tracking-wider text-ash md:grid`}>
        <div className="text-left">ARTIST</div>
        {COLUMNS.map((c) => (
          <div key={c.key}>{c.label.toUpperCase()}</div>
        ))}
      </div>

      {guesses.length === 0 && (
        <p className="mt-4 border-t border-hairline pt-4 text-center text-ash">
          Your guesses will appear here.
        </p>
      )}

      {/* Newest guess on top. */}
      {[...guesses].reverse().map((g) => (
        <div key={g.id} className={`${ROW} mt-3 md:mt-1`}>
          <div className="col-span-5 flex items-center rounded-sm bg-parchment px-3 py-2 text-sm font-bold md:col-span-1">
            {g.name}
          </div>
          {compareArtists(g, answer).map((cell, i) => (
            <Tile key={cell.key} cell={cell} label={COLUMNS[i].label} />
          ))}
        </div>
      ))}
    </section>
  )
}
