export function creditsLeft(state, team) {
  return state.config.budget - (team?.spent ?? 0)
}

export function playersOfTeam(state, teamId) {
  return state.players.filter((p) => p.teamId === teamId)
}

export function rosterSize(state) {
  return Math.max(state.config.formationSize, state.config.rosterSize ?? state.config.formationSize)
}

export function isAuctionComplete(state) {
  const { players, teams, auctionDone } = state
  if (auctionDone) return true
  if (players.length === 0) return false
  const free = players.filter((p) => !p.teamId).length
  if (free === 0) return true
  const size = rosterSize(state)
  return teams.every((t) => playersOfTeam(state, t.id).length >= size)
}
