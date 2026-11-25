// Motore di simulazione: solo matematica casuale, nessun LLM.
// Punti base del giocatore: intero casuale tra config.minPoints e config.maxPoints.
// Eventi bonus/malus: ognuno ha una probabilità propria (chance, %) e punti (anche negativi).

const randInt = (min, max) => {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function simulatePlayer(player, config, events) {
  const base = randInt(config.minPoints, config.maxPoints)
  const fired = []
  let total = base
  for (const ev of events) {
    const chance = Math.max(0, Math.min(100, Number(ev.chance) || 0))
    if (chance > 0 && Math.random() * 100 < chance) {
      const pts = Number(ev.points) || 0
      fired.push({ label: ev.label, points: pts })
      total += pts
    }
  }
  return { playerId: player.id, name: player.name, base, ev: fired, total }
}

export function simulateMatchday({ config, teams, players, events, dateKey, lineups }) {
  const active = events
  const details = {}
  for (const team of teams) {
    const ids = lineups?.[team.id] ?? []
    const roster = ids
      .map((pid) => players.find((p) => p.id === pid))
      .filter(Boolean)
      .slice(0, config.formationSize)
    const simulated = roster.map((p) => simulatePlayer(p, config, active))
    details[team.id] = {
      total: simulated.reduce((s, x) => s + x.total, 0),
      players: simulated,
    }
  }
  return { dateKey, computedAt: new Date().toISOString(), details }
}
