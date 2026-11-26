import { dateRange } from '../lib/schedule'

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

// Classifica a punti totali con pari merito: stessa posizione per punti uguali.
// Un'unica funzione usata sia dalla schermata Classifica che dalla modalità ospite.
export function standings(state) {
  const dates = dateRange(state.config.startDate, state.config.endDate)
  const computed = dates.filter((d) => state.results[d])
  const sorted = state.teams
    .map((team) => {
      const played = computed.filter((d) => state.results[d]?.details?.[team.id])
      const points = played.reduce((sum, d) => sum + (state.results[d].details[team.id]?.total ?? 0), 0)
      return { team, played: played.length, points }
    })
    .sort((a, b) => b.points - a.points || a.team.name.localeCompare(b.team.name, 'it'))
  const rows = sorted.map((row) => {
    const first = sorted.findIndex((r) => r.points === row.points)
    return { ...row, position: first + 1 }
  })
  return { rows, computed }
}
