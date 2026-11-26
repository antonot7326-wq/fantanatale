import { describe, it, expect } from 'vitest'
import { simulateMatchday, recomputeDay } from '../src/lib/sim'

const config = { minPoints: 40, maxPoints: 100, formationSize: 2 }
const teams = [{ id: 't1', name: 'Rossi' }, { id: 't2', name: 'Bianchi' }]
const players = [
  { id: 'p1', name: 'Papà' },
  { id: 'p2', name: 'Mamma' },
  { id: 'p3', name: 'Zio' },
  { id: 'p4', name: 'Nonna' },
]

describe('simulateMatchday', () => {
  it('somma base e bonus/malus assegnati (A-fix: niente casualità sui bonus)', () => {
    const result = simulateMatchday({
      config,
      teams,
      players,
      dateKey: '2025-12-24',
      lineups: { t1: ['p1', 'p2'], t2: ['p3', 'p4'] },
      assignments: { p1: [{ id: 'e1', label: 'gol', points: 5 }], p3: [{ id: 'e2', label: 'cartellino', points: -7 }] },
    })
    const p1 = result.details.t1.players.find((x) => x.playerId === 'p1')
    const p3 = result.details.t2.players.find((x) => x.playerId === 'p3')
    expect(p1.ev).toEqual([{ id: 'e1', label: 'gol', points: 5 }])
    expect(p1.total).toBe(p1.base + 5)
    expect(p3.total).toBe(p3.base - 7)
  })
  it('punti base nel range configurato', () => {
    const result = simulateMatchday({ config, teams, players, dateKey: 'd', lineups: { t1: ['p1', 'p2'], t2: ['p3', 'p4'] } })
    const all = Object.values(result.details).flatMap((d) => d.players)
    for (const p of all) expect(p.base).toBeGreaterThanOrEqual(40)
    for (const p of all) expect(p.base).toBeLessThanOrEqual(100)
  })
  it('salva gli accoppiamenti nel risultato (B10)', () => {
    const result = simulateMatchday({ config, teams, players, dateKey: 'd', lineups: {}, pairs: [['t1', 't2']] })
    expect(result.pairs).toEqual([['t1', 't2']])
  })
  it('la forza sposta i punti base in media (C3)', () => {
    const strong = { id: 'p1', name: 'Forte', strength: 10 }
    const weak = { id: 'p2', name: 'Debole', strength: 1 }
    let strongSum = 0
    let weakSum = 0
    for (let i = 0; i < 300; i++) {
      strongSum += simulateMatchday({ config, teams: [teams[0]], players: [strong], dateKey: 'd', lineups: { t1: ['p1'] } }).details.t1.players[0].base
      weakSum += simulateMatchday({ config, teams: [teams[0]], players: [weak], dateKey: 'd', lineups: { t1: ['p2'] } }).details.t1.players[0].base
    }
    expect(strongSum / 300).toBeGreaterThan(weakSum / 300)
  })
})

describe('recomputeDay (B5)', () => {
  it('mantiene gli stessi punti base e rifà solo i totali', () => {
    const first = simulateMatchday({
      config, teams, players, dateKey: 'd',
      lineups: { t1: ['p1'], t2: ['p3'] },
      assignments: {},
    })
    const before = Object.fromEntries(
      Object.values(first.details).flatMap((d) => d.players).map((x) => [x.playerId, x.base]),
    )
    const recomputed = recomputeDay(first, { p1: [{ id: 'e1', label: 'gol', points: 10 }] })
    const p1 = recomputed.details.t1.players[0]
    expect(p1.base).toBe(before.p1)
    expect(p1.total).toBe(before.p1 + 10)
    const p3 = recomputed.details.t2.players[0]
    expect(p3.base).toBe(before.p3)
    expect(p3.total).toBe(before.p3)
  })
})
