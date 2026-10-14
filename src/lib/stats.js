import { todayKey } from './daily'

export const MAX_GUESSES = 8;

const EMPTY = {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayed: null, // day key of the last finished game
    lastWon: null, // day key of the last win
    distribution: Array(MAX_GUESSES).fill(0), // wins by number of guesses
}

function storageKey(mode) {
    return `artistguessr:stats:${mode}`
}

function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1)
    return todaykey(d)
}

export function loadStats(mode) {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey(mode)))
        if (!saved) return EMPTY
        const stats =  { ...EMPTY, ...saved }
        if (stats.lastWon !== todayKey() && stats.lastWon !== yesterdayKey()) {
            stats.currentStreak = 0
        }
        return stats
    } catch {
        return EMPTY
    }
}

export function recordResult(mode, won, guessCount) {
    const stats = loadStats(mode)
    const today = todayKey()
    if (stats.lastPlayed === today) return stats
    
    const next = {
        ...stats,
        played: stats.played + 1,
        lastPlayed: today,
        distribution: [...stats.distribution],
    }

    if (won) {
        next.wins = stats.wins + 1
        next.currentStreak = stats.currentStreak + 1
        next.maxStreak = Math.max(stats.maxStreak, next.currentStreak)
        next.lastWon = today
        next.distribution[guessCount - 1] += 1
    } else {
        next.currentStreak = 0
    }

    try {
        localStorage.setItem(storageKey(mode), JSON.stringify(next))
    } catch {
        // storage can be blocked. stats just won't be saved.
    }

    return next
}