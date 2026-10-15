import { useState } from 'react'
import { dayNumber, todayKey } from '../lib/daily'
import { dayStatus, loadGuesses } from '../lib/progress'
import Icon from './Icon'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const FIRST_MONTH = new Date(2026, 9, 1) // the game launched in October 2026

// One circle per day, colored by how that day went.
const CIRCLE = {
  won: 'bg-match text-bone',
  lost: 'border-2 border-crimson text-crimson',
  playing: 'bg-close text-ink',
  unplayed: 'bg-parchment hover:bg-hairline',
  today: 'bg-ink text-bone',
  unavailable: 'text-ash/50',
}

function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}

// Every day in the month, plus blank cells so the 1st lines up with its weekday.
function monthDays(month) {
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const blanks = Array.from({ length: month.getDay() }, () => null)
  const days = Array.from(
    { length: count },
    (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
  )
  return [...blanks, ...days]
}

export default function Archive({ mode, answerFor, maxGuesses, unlocked }) {
  const today = todayKey()
  const thisMonth = addMonths(new Date(), 0)
  const [month, setMonth] = useState(thisMonth)

  function describe(date) {
    const key = todayKey(date)
    if (key === today) return { key, status: 'today' }
    if (key > today || dayNumber(date) < 0) return { key, status: 'unavailable' }
    const ids = loadGuesses(mode, key)
    return { key, status: dayStatus(ids, answerFor(date)?.id, maxGuesses), count: ids.length }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-4xl font-black">Archive</h1>
      <p className="mt-1 text-ash">Play any past puzzle. These don't affect your streak.</p>

      {!unlocked && (
        <p className="mt-6 flex items-center gap-3 rounded-sm bg-plum px-4 py-3 text-sm text-bone">
          <Icon name="lock" />
          The archive unlocks once you finish today's puzzle.
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={month <= FIRST_MONTH}
          aria-label="Previous month"
          className="rounded-full p-2 hover:bg-parchment disabled:opacity-30"
        >
          <Icon name="left" />
        </button>
        <h2 className="text-lg font-bold">
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={month >= thisMonth}
          aria-label="Next month"
          className="rounded-full p-2 hover:bg-parchment disabled:opacity-30"
        >
          <Icon name="right" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-3 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="text-xs font-bold text-ash">
            {d}
          </div>
        ))}
        {monthDays(month).map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />
          const day = describe(date)
          const playable = day.status === 'today' || (unlocked && day.status !== 'unavailable')
          const circle = (
            <span
              className={`mx-auto flex size-10 items-center justify-center rounded-full text-sm font-bold sm:size-12 ${CIRCLE[day.status]}`}
            >
              {day.status === 'won' ? <Icon name="check" size={18} /> : date.getDate()}
            </span>
          )
          const label = (
            <span className="mt-0.5 block h-3 text-[10px] text-ash">
              {day.status === 'won' && `${day.count}/${maxGuesses}`}
              {day.status === 'today' && 'Today'}
            </span>
          )
          return playable ? (
            <a key={day.key} href={day.status === 'today' ? '/' : `?day=${day.key}`} title={day.key}>
              {circle}
              {label}
            </a>
          ) : (
            <div key={day.key} className={day.status === 'unavailable' ? '' : 'opacity-60'}>
              {circle}
              {label}
            </div>
          )
        })}
      </div>

      <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-match" />Solved</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full border-2 border-crimson" />Missed</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-close" />In progress</li>
        <li className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-parchment" />Not played</li>
      </ul>
    </main>
  )
}
