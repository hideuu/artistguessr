import { pastDays } from "../lib/daily"

// what happened on a past day, read from that day
function result(mode, key, answerFor, maxGuesses) {
    try {
        const ids = JSON.parse(localStorage.getItem(`artistguessr:${mode}:${key}`)) || []
        if (!ids.length) return { label: 'Not played', style: 'text-paper/60'}
        if (ids.includes(answerFor(key)?.id)) return { label: `Solved in ${ids.length}`, style: 'text-hit' }
        if (ids.length >= maxGuesses) return { label: 'Missed', style: 'text-miss' }
        return { label: 'In progress', style: 'text-near' }
    } catch {
        return { label: 'Not played', style: 'text-paper/60' }
    }
}

export default function Archive({ mode, answerFor, maxGuesses, onClose }) {
    const days = pastDays()

    return (
       <section className="mt-6 rounded-xl border border-line bg-panel p-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Archive</h2>
            <button onClick={onClose} className="text-sm text-paper/70 hover:text-paper">
            Close
            </button>
        </div>
        <p className="mt-1 text-sm text-paper/70">
            Replay past puzzles. These don't count toward your streak.
        </p>
        {days.length === 0 ? (
            <p className="mt-4 text-paper/60">No past puzzles yet. Come back tomorrow.</p>
        ) : (
            <ul className="mt-4 divide-y divide-line">
            {days.map(({ key, number }) => {
                const r = result(mode, key, answerFor, maxGuesses)
                return (
                <li key={key}>
                    <a
                    href={`?day=${key}`}
                    className="flex items-center justify-between py-2.5 hover:text-near"
                    >
                    <span>
                        <span className="font-semibold">#{number}</span>{' '}
                        <span className="text-paper/80">{key}</span>
                    </span>
                    <span className={`text-sm ${r.style}`}>{r.label}</span>
                    </a>
                </li>
                )
            })}
            </ul>
        )}
        </section> 
    )
}