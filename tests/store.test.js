import { describe, it, expect } from 'vitest'
import { normalizeState, defaultConfig, nextChristmasRange } from '../src/state/store'
import { freeTeamName } from '../src/screens/TeamsEditor'

describe('nextChristmasRange (C5)', () => {
  it('restituisce sempre un 24 dicembre futuro e un 6 gennaio successivo', () => {
    const { startDate, endDate } = nextChristmasRange()
    const now = new Date()
    const start = new Date(`${startDate}T12:00:00`)
    expect(start.getTime()).toBeGreaterThan(now.getTime() - 24 * 3600 * 1000)
    expect(Number(endDate.slice(0, 4))).toBe(Number(startDate.slice(0, 4)) + 1)
    expect(endDate.slice(5)).toBe('01-06')
    expect(startDate.slice(5)).toBe('12-24')
  })
})

describe('defaultConfig', () => {
  it('usa il calendario dinamico', () => {
    const { startDate } = nextChristmasRange()
    expect(defaultConfig().startDate).toBe(startDate)
    expect(defaultConfig().rosterSize).toBeGreaterThanOrEqual(defaultConfig().formationSize)
  })
})

describe('normalizeState (A8, B14, C3, C4)', () => {
  it('dati vuoti o rotti tornano uno stato pulito', () => {
    const empty = normalizeState(null)
    expect(empty.players).toEqual([])
    expect(empty.config.formationSize).toBeGreaterThan(0)
    expect(normalizeState({ players: 'nope', teams: 42 }).players).toEqual([])
  })
  it('scarta giocatori senza id o senza nome', () => {
    const state = normalizeState({
      players: [{ id: 'p1', name: 'Ok' }, { name: 'Senza id' }, { id: 'p2' }, null, 'x'],
      teams: [{ id: 't1', name: 'Uno' }],
    })
    expect(state.players.map((p) => p.id)).toEqual(['p1'])
  })
  it('scarta gli id di giocatori inesistenti da formazioni e assegnazioni (B6)', () => {
    const state = normalizeState({
      players: [{ id: 'p1', name: 'Ok' }],
      teams: [{ id: 't1', name: 'Uno' }],
      lineups: { '2025-12-24': { t1: ['p1', 'fantasma'], t2: ['p1'] } },
      assignments: { '2025-12-24': { p1: [{ label: 'gol', points: 3 }], fantasma: [{ label: 'x', points: 1 }] } },
    })
    expect(state.lineups['2025-12-24'].t1).toEqual(['p1'])
    expect(state.lineups['2025-12-24'].t2).toBeUndefined()
    expect(state.assignments['2025-12-24'].p1).toHaveLength(1)
    expect(state.assignments['2025-12-24'].fantasma).toBeUndefined()
  })
  it('completa le assegnazioni con id e regola riconosciuta per label+punti (B14)', () => {
    const state = normalizeState({
      events: [{ id: 'r1', label: 'gol', points: 3 }],
      players: [{ id: 'p1', name: 'Ok' }],
      assignments: { '2025-12-24': { p1: [{ label: 'gol', points: 3 }] } },
    })
    const [ev] = state.assignments['2025-12-24'].p1
    expect(ev.id).toBeTruthy()
    expect(ev.ruleId).toBe('r1')
  })
  it('dà a ogni giocatore una forza nel range 1-10 (C3)', () => {
    const state = normalizeState({ players: [{ id: 'p1', name: 'Ok', strength: 99 }, { id: 'p2', name: 'Due' }] })
    expect(state.players[0].strength).toBe(10)
    expect(state.players[1].strength).toBe(5)
  })
  it('rosa mai più piccola dei titolari (C4)', () => {
    const state = normalizeState({ config: { formationSize: 4, rosterSize: 2 } })
    expect(state.config.rosterSize).toBe(4)
    const state2 = normalizeState({ config: { formationSize: 4 } })
    expect(state2.config.rosterSize).toBeGreaterThanOrEqual(6)
  })
  it('minPoints resta sempre sotto maxPoints (B9)', () => {
    const state = normalizeState({ config: { minPoints: 90, maxPoints: 20 } })
    expect(state.config.minPoints).toBeLessThanOrEqual(state.config.maxPoints)
  })
  it('lotto d\u2019asta con giocatore inesistente scartato (A3)', () => {
    const state = normalizeState({ auctionLot: { playerId: 'ghost', bid: 5, bidderId: null } })
    expect(state.auctionLot).toBeNull()
  })
})

describe('freeTeamName (B7)', () => {
  it('evita duplicati dopo una rimozione', () => {
    expect(freeTeamName([{ name: 'Squadra 1' }])).toBe('Squadra 2')
    expect(freeTeamName([{ name: 'Squadra 1' }, { name: 'Squadra 2' }, { name: 'Squadra 3' }])).toBe('Squadra 4')
    expect(freeTeamName([{ name: 'squadra 1' }])).toBe('Squadra 2')
    expect(freeTeamName([])).toBe('Squadra 1')
  })
})

describe('normalizeState: ruolo del telefono', () => {
  it('accetta guest e torna admin in caso di valore strano', () => {
    expect(normalizeState({ net: { url: 'https://x.firebaseio.com', room: 'r', enabled: true, role: 'guest' } }).net.role).toBe('guest')
    expect(normalizeState({ net: { enabled: true, role: ' hacker ' } }).net.role).toBe('admin')
    expect(normalizeState({}).net.role).toBe('admin')
  })
})
