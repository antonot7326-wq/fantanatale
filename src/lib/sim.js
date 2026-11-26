// Motore di gioco: punti base casuali (la "partita"), bonus e malus assegnati dall'host.
// Nessuna probabilità: chi calcola la giornata decide chi prende cosa.
// I punti base vengono salvati al primo calcolo (B5): correggere i bonus dopo
// non cambia la "partita", vengono solo rifatti i totali.
// La forza del giocatore (1-10, scelta dall'host) sposta i punti base (C3).

const randInt = (min, max) => {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function baseFor(player, config) {
  const min = Number(config.minPoints) || 0
  const max = Math.max(min, Number(config.maxPoints) || min)
  const raw = randInt(min, max)
  const strength = Math.min(10, Math.max(1, Number(player.strength) || 5))
  const shifted = Math.round(raw + ((strength - 5) * (max - min)) / 20)
  return Math.max(0, shifted)
}

function simulatePlayer(player, config, assigned) {
  const base = baseFor(player, config)
  const ev = (assigned ?? []).map((x) => ({ id: x.id, label: x.label, points: Number(x.points) || 0 }))
  const total = base + ev.reduce((s, x) => s + x.points, 0)
  return { playerId: player.id, name: player.name, base, ev, total }
}

export function simulateMatchday({ config, teams, players, dateKey, lineups, assignments, pairs }) {
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
  return { dateKey, computedAt: new Date().toISOString(), pairs: pairs ?? [], details }
}

// Ricalcola i totali di una giornata già calcolata tenendo gli stessi punti base (B5).
export function recomputeDay(result, assignments) {
  const day = assignments ?? {}
  const details = {}
  for (const [teamId, detail] of Object.entries(result.details ?? {})) {
    const players = (detail.players ?? []).map((x) => {
      const ev = (day[x.playerId] ?? []).map((e) => ({ id: e.id, label: e.label, points: Number(e.points) || 0 }))
      return { ...x, ev, total: x.base + ev.reduce((s, e) => s + e.points, 0) }
    })
    details[teamId] = { total: players.reduce((s, x) => s + x.total, 0), players }
  }
  return { ...result, details }
}
