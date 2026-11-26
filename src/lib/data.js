// Una sola semantica per la formazione (B4): lineupFor restituisce la formazione
// che scende in campo in quella giornata: quella scelta esplicitamente, oppure
// ereditata dall'ultima giornata in cui è stata scelta. Array vuoto = nessuna.
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

// Il giorno in cui la formazione è stata scelta l'ultima volta prima di dateKey (o dateKey stessa).
export function lineupSourceDay(state, dateKey, teamId) {
  if (state.lineups[dateKey]?.[teamId]?.length) return dateKey
  const keys = Object.keys(state.lineups).filter((k) => k < dateKey).sort()
  for (let i = keys.length - 1; i >= 0; i--) {
    if (state.lineups[keys[i]]?.[teamId]?.length) return keys[i]
  }
  return null
}
