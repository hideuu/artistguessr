function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl font-black tabular-nums">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  )
}

export default function StatsPanel({ stats, highlight }) {
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0
  const top = Math.max(1, ...stats.distribution)

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        <Stat value={stats.played} label="Played" />
        <Stat value={winRate} label="Win %" />
        <Stat value={stats.currentStreak} label="Current Streak" />
        <Stat value={stats.maxStreak} label="Max Streak" />
      </div>

      <p className="mt-6 text-xs font-bold tracking-wider">GUESS DISTRIBUTION</p>
      <ol className="mt-2 space-y-1">
        {stats.distribution.map((count, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 tabular-nums">{i + 1}</span>
            <span
              className={`px-2 py-0.5 text-right font-bold tabular-nums text-bone ${
                highlight === i + 1 ? 'bg-match' : 'bg-ash'
              }`}
              style={{ width: `${Math.max(7, (count / top) * 100)}%` }}
            >
              {count}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
