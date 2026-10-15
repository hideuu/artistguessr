// Saved guesses for one day of one mode, as a list of artist ids.
export function loadGuesses(mode, dayKey) {
  try {
    return JSON.parse(localStorage.getItem(`artistguessr:${mode}:${dayKey}`)) || []
  } catch {
    return []
  }
}

// Where a player stands on one puzzle: "unplayed", "playing", "won" or "lost".
export function dayStatus(guessIds, answerId, maxGuesses) {
  if (guessIds.length === 0) return 'unplayed'
  if (guessIds.includes(answerId)) return 'won'
  if (guessIds.length >= maxGuesses) return 'lost'
  return 'playing'
}

export function isFinished(status) {
  return status === 'won' || status === 'lost'
}
