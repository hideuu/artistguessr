function Stat({ value, label }) {
    return (
        <div className="text-center">
            <div className="text-3x1 font-bold tabular-nums">{value}</div>
            <div className="text-xs text-paper/70">{label}</div>
        </div>
    )
}

export default function StatsPanel({ stats, highlight}) {
    const winRate = stats.played ? Math.round((stats.wins/stats.played) * 100) : 0
    const top = Math.max(1, ...stats.distribution)

    return (
        <div className="mt-5">
        <div className="grid grid-cols-4 gap-2">
            <Stat value={stats.played} label="Played" />
            <Stat value={`${winRate}%`} label="Win %" />
            <Stat value={stats.currentStreak} label="Streak" />
            <Stat value={stats.maxStreak} label="Best streak" />
        </div>

        <p className="mt-5 text-sm font-semibold">Guesses to win</p>
        <ol className="mt-2 space-y-1">
            {stats.distribution.map((count, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
                <span className="w-3 tabular-nums">{i + 1}</span>
                <span
                className={`rounded px-2 py-0.5 text-right font-semibold tabular-nums ${
                    highlight === i + 1 ? 'bg-hit text-white' : 'bg-line'
                }`}
                style={{ width: `${Math.max(8, (count / top) * 100)}%` }}
                >
                {count}
                </span>
            </li>
            ))}
        </ol>
        </div>
    )

}