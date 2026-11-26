import { describe, it, expect } from 'vitest'
import { creditsLeft, playersOfTeam, isAuctionComplete, rosterSize, standings } from '../src/state/selectors'

const makeState = (over = {}) => ({
  config: { budget: 100, formationSize: 2, rosterSize: 3 },
  players: [
    { id: 'p1', name: 'A', teamId: 't1' },
    { id: 'p2', name: 'B', teamId: 't1' },
    { id: 'p3', name: 'C', teamId: null },
  ],
  teams: [
    { id: 't1', name: 'Uno', spent: 30 },
    { id: 't2', name: 'Due', spent: 0 },
  ],
  auctionDone: false,
  ...over,
})

describe('creditsLeft', () => {
  it('budget meno speso', () => {
    const state = makeState()
    expect(creditsLeft(state, state.teams[0])).toBe(70)
    expect(creditsLeft(state, null)).toBe(100)
  })
})

describe('playersOfTeam', () => {
  it('filtra per squadra', () => {
    expect(playersOfTeam(makeState(), 't1')).toHaveLength(2)
  })
})

describe('rosterSize (C4)', () => {
  it('usa rosterSize se presente', () => {
    expect(rosterSize(makeState())).toBe(3)
  })
  it('senza rosterSize ricade su formationSize', () => {
    const state = makeState()
    delete state.config.rosterSize
    expect(rosterSize(state)).toBe(2)
  })
})

describe('isAuctionComplete', () => {
  it('falsa se ci sono giocatori liberi e rose incomplete', () => {
    expect(isAuctionComplete(makeState())).toBe(false)
  })
  it('vera quando tutti hanno squadra', () => {
    const state = makeState({ players: [
      { id: 'p1', name: 'A', teamId: 't1' },
      { id: 'p2', name: 'B', teamId: 't1' },
      { id: 'p3', name: 'C', teamId: 't2' },
    ] })
    expect(isAuctionComplete(state)).toBe(true)
  })
  it('vera se tutte le rose raggiungono la rosa completa', () => {
    const state = makeState({ players: [
      { id: 'p1', name: 'A', teamId: 't1' },
      { id: 'p2', name: 'B', teamId: 't1' },
      { id: 'p3', name: 'C', teamId: 't1' },
      { id: 'p4', name: 'D', teamId: 't2' },
      { id: 'p5', name: 'E', teamId: 't2' },
      { id: 'p6', name: 'F', teamId: 't2' },
    ] })
    expect(isAuctionComplete(state)).toBe(true)
  })
  it('vera se l\u2019asta è stata terminata a mano', () => {
    expect(isAuctionComplete(makeState({ auctionDone: true }))).toBe(true)
  })
})

describe('standings', () => {
  const mk = () => ({
    config: { startDate: '2026-12-24', endDate: '2026-12-25' },
    teams: [
      { id: 't1', name: 'Rossi' },
      { id: 't2', name: 'Bianchi' },
      { id: 't3', name: 'Verdi' },
    ],
    results: {
      '2026-12-24': { details: { t1: { total: 80 }, t2: { total: 90 }, t3: { total: 80 } } },
    },
  })

  it('ordina per punti decrescenti', () => {
    const { rows } = standings(mk())
    expect(rows.map((r) => r.team.name)).toEqual(['Bianchi', 'Rossi', 'Verdi'])
  })

  it('pari merito: stessa posizione per punti uguali', () => {
    const { rows } = standings(mk())
    expect(rows.find((r) => r.team.name === 'Bianchi').position).toBe(1)
    expect(rows.find((r) => r.team.name === 'Rossi').position).toBe(2)
    expect(rows.find((r) => r.team.name === 'Verdi').position).toBe(2)
  })

  it('somma solo le giornate calcolate', () => {
    const s = mk()
    s.results['2026-12-25'] = { details: { t1: { total: 50 } } }
    const { rows, computed } = standings(s)
    expect(computed).toHaveLength(2)
    expect(rows.find((r) => r.team.name === 'Rossi').points).toBe(130)
    expect(rows.find((r) => r.team.name === 'Rossi').played).toBe(2)
    expect(rows.find((r) => r.team.name === 'Bianchi').played).toBe(1)
  })
})
