import { describe, it, expect } from 'vitest'
import { lineupFor, lineupSourceDay } from '../src/lib/data'

const state = {
  lineups: {
    '2025-12-24': { t1: ['p1', 'p2'] },
    '2025-12-25': { t2: ['p3'] },
  },
}

describe('lineupFor (B3, B4)', () => {
  it('restituisce la formazione scelta per quel giorno', () => {
    expect(lineupFor(state, '2025-12-24', 't1')).toEqual(['p1', 'p2'])
  })
  it('eredita dall\u2019ultima giornata con formazione scelta', () => {
    expect(lineupFor(state, '2025-12-26', 't1')).toEqual(['p1', 'p2'])
    expect(lineupFor(state, '2025-12-25', 't1')).toEqual(['p1', 'p2'])
  })
  it('formazione vuota significa "non scelta" ed eredita', () => {
    expect(lineupFor({ lineups: { '2025-12-24': { t1: [] } } }, '2025-12-24', 't1')).toEqual([])
    expect(lineupFor({ lineups: { '2025-12-24': { t1: ['p9'] }, '2025-12-25': { t1: [] } } }, '2025-12-25', 't1')).toEqual(['p9'])
  })
  it('senza storia torna vuota', () => {
    expect(lineupFor(state, '2025-12-20', 't2')).toEqual([])
  })
  it('lineupSourceDay trova il giorno di origine', () => {
    expect(lineupSourceDay(state, '2025-12-26', 't1')).toBe('2025-12-24')
    expect(lineupSourceDay(state, '2025-12-20', 't1')).toBeNull()
  })
})
