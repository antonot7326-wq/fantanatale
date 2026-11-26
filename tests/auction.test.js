import { describe, it, expect } from 'vitest'
import { maxBidNow, canRaise, applySell, undoLastPurchase } from '../src/lib/auction'

describe('maxBidNow (A5)', () => {
  it('lascia 1 credito per ogni slot ancora vuoto', () => {
    expect(maxBidNow(100, 0, 3)).toBe(98)
    expect(maxBidNow(100, 1, 3)).toBe(99)
    expect(maxBidNow(100, 2, 3)).toBe(100)
  })
  it('con rosa completa non si può offrire', () => {
    expect(maxBidNow(100, 3, 3)).toBe(0)
  })
})

describe('canRaise (A5)', () => {
  const base = { currentBid: 10, amount: 1, isLeader: false, rosterCount: 0, rosterSize: 3, credits: 20 }
  it('permette un rilancio nei limiti', () => {
    expect(canRaise(base)).toBe(true)
  })
  it('blocca oltre i crediti riservati', () => {
    expect(canRaise({ ...base, credits: 10 })).toBe(false)
  })
  it('blocca chi è già in testa', () => {
    expect(canRaise({ ...base, isLeader: true })).toBe(false)
  })
  it('blocca con rosa completa', () => {
    expect(canRaise({ ...base, rosterCount: 3 })).toBe(false)
  })
})

describe('applySell (A3, A4)', () => {
  const state = {
    auctionLot: { playerId: 'p1', bid: 25, bidderId: 't2' },
    players: [{ id: 'p1', name: 'Papà', teamId: null }],
    teams: [
      { id: 't1', name: 'Uno', spent: 0 },
      { id: 't2', name: 'Due', spent: 0 },
    ],
    purchases: [],
  }
  it('vende alla squadra indicata, non a quella in testa (A4)', () => {
    const next = applySell(state, 't1')
    expect(next.players[0].teamId).toBe('t1')
    expect(next.teams.find((t) => t.id === 't1').spent).toBe(25)
    expect(next.auctionLot).toBeNull()
  })
  it('vende alla squadra in testa se non indicata', () => {
    const next = applySell(state)
    expect(next.players[0].teamId).toBe('t2')
    expect(next.purchases).toHaveLength(1)
  })
  it('non esplode senza lotto (A3)', () => {
    expect(applySell({ ...state, auctionLot: null }).auctionLot).toBeNull()
  })
  it('svuota il lotto se squadra o giocatore non esistono più (A3)', () => {
    const next = applySell({ ...state, teams: [] })
    expect(next.auctionLot).toBeNull()
  })
})

describe('undoLastPurchase (D)', () => {
  const state = {
    players: [{ id: 'p1', name: 'Papà', teamId: 't1', price: 25 }],
    teams: [{ id: 't1', name: 'Uno', spent: 25 }],
    purchases: [{ playerId: 'p1', playerName: 'Papà', teamId: 't1', price: 25 }],
  }
  it('libera il giocatore e restituisce i crediti', () => {
    const next = undoLastPurchase(state)
    expect(next.players[0].teamId).toBeNull()
    expect(next.teams[0].spent).toBe(0)
    expect(next.purchases).toHaveLength(0)
  })
  it('non fa nulla senza acquisti', () => {
    const before = undoLastPurchase({ ...state, purchases: [] })
    expect(before.players).toEqual(state.players)
    expect(before.teams).toEqual(state.teams)
    expect(before.purchases).toEqual([])
  })
})
