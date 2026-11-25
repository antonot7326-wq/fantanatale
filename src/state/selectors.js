export function creditsLeft(state, team) {
  return state.config.budget - (team?.spent ?? 0)
}

export function playersOfTeam(state, teamId) {
  return state.players.filter((p) => p.teamId === teamId)
}

export function rosterNames(state, ids) {
  return ids.map((id) => state.players.find((p) => p.id === id)?.name ?? '?')
}

export function isAuctionComplete(state) {
  const { players, teams, config, auctionDone } = state
  if (auctionDone) return true
  if (players.length === 0) return false
  const free = players.filter((p) => !p.teamId).length
  if (free === 0) return true
  return teams.every((t) => playersOfTeam(state, t.id).length >= config.formationSize)
}

export const SCREENS = [
  { id: 'setup', label: 'Impostazioni', hint: 'Lega, host, budget, squadre' },
  { id: 'players', label: 'Giocatori', hint: 'Inserisci i familiari' },
  { id: 'rules', label: 'Bonus e Malus', hint: 'Regole dei punti' },
  { id: 'auction', label: 'Asta', hint: 'Acquista i giocatori' },
  { id: 'lineups', label: 'Formazioni', hint: 'Scegli gli schierati' },
  { id: 'matchdays', label: 'Giornate', hint: 'Calcola i risultati delle giornate' },
  { id: 'standings', label: 'Classifica', hint: 'Punti e risultati' },
]
