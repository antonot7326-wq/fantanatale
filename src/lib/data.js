export function lineupFor(state, dateKey, teamId) {
  const own = state.lineups[dateKey]?.[teamId]
  if (own && own.length) return own
  const keys = Object.keys(state.lineups).filter((k) => k < dateKey).sort()
  for (let i = keys.length - 1; i >= 0; i--) {
    const prev = state.lineups[keys[i]]?.[teamId]
    if (prev && prev.length) return prev
  }
  return []
}
