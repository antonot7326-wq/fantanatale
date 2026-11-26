// Motore di gioco: punti base casuali (la "simulazione"), bonus e malus assegnati dall'host.
// Nessuna probabilità: chi calcola la giornata decide chi prende cosa.

const randInt = (min, max) => {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function simulatePlayer(player, config, assigned) {
  const base = randInt(config.minPoints, config.maxPoints)
  const ev = (assigned ?? []).map((x) => ({ label: x.label, points: Number(x.points) || 0 }))
  const total = base + ev.reduce((s, x) => s + x.points, 0)
  return { playerId: player.id, name: player.name, base, ev, total }
}

export function simulateMatchday({ config, teams, players, dateKey, lineups, assignments }) {
  const dayAssignments = assignments ?? {}
  const details = {}
  for (const team of teams) {
    const ids = lineups?.[team.id] ?? []
    const roster = ids
      .map((pid) => players.find((p) => p.id === pid))
      .filter(Boolean)
      .slice(0, config.formationSize)
    const simulated = roster.map((p) => simulatePlayer(p, config, dayAssignments[p.id]))
    details[team.id] = {
      total: simulated.reduce((s, x) => s + x.total, 0),
      players: simulated,
    }
  }
  return { dateKey, computedAt: new Date().toISOString(), details }
}
