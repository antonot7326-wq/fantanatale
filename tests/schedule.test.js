import { describe, it, expect } from 'vitest'
import { roundRobin, scheduleForDate, dateRange, toDateKey, todayKey, isToday } from '../src/lib/schedule'

describe('roundRobin', () => {
  it('con 2 squadre fa un solo giro con una sfida', () => {
    expect(roundRobin(['a', 'b'])).toEqual([[['a', 'b']]])
  })
  it('con 3 squadre fa 3 giri con un riposo a giro', () => {
    const rounds = roundRobin(['a', 'b', 'c'])
    expect(rounds).toHaveLength(3)
    for (const round of rounds) {
      expect(round).toHaveLength(2)
      const flat = round.flat()
      expect(flat.filter((x) => x === null)).toHaveLength(1)
    }
  })
  it('con 4 squadre fa 3 giri senza riposi', () => {
    const rounds = roundRobin(['a', 'b', 'c', 'd'])
    expect(rounds).toHaveLength(3)
    rounds.forEach((round) => expect(round.flat()).not.toContain(null))
  })
  it('con 5 squadre fa 5 giri, ognuno con un riposo', () => {
    const rounds = roundRobin(['a', 'b', 'c', 'd', 'e'])
    expect(rounds).toHaveLength(5)
    rounds.forEach((round) => {
      expect(round.flat().filter((x) => x === null)).toHaveLength(1)
    })
  })
})

describe('scheduleForDate', () => {
  const teams = ['a', 'b', 'c', 'd']
  it('la prima giornata non è specchiata', () => {
    expect(scheduleForDate(teams, '2025-12-24', 0)).toEqual(roundRobin(teams)[0])
  })
  it('dopo un giro completo gli accoppiamenti si specchiano (andata/ritorno alternati, B1)', () => {
    const first = scheduleForDate(teams, 'd1', 0)
    const fourth = scheduleForDate(teams, 'd4', 3)
    expect(fourth.map(([x, y]) => [y, x])).toEqual(first)
    const seventh = scheduleForDate(teams, 'd7', 6)
    expect(seventh).toEqual(roundRobin(teams)[0])
  })
  it('con squadre dispari il riposo sta sempre a destra (B2)', () => {
    const odd = ['a', 'b', 'c']
    for (let i = 0; i < 6; i++) {
      const day = scheduleForDate(odd, `d${i}`, i)
      day.forEach(([home, away]) => {
        expect(home).not.toBeNull()
      })
      const rest = day.find(([, away]) => away === null)
      if (i < 3) expect(rest).toBeDefined()
    }
  })
})

describe('date e oggi in ora locale (A9)', () => {
  it('dateRange include entrambi gli estremi', () => {
    expect(dateRange('2025-12-30', '2026-01-02')).toEqual(['2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02'])
  })
  it('dateRange con date invertite torna vuota', () => {
    expect(dateRange('2026-01-02', '2025-12-30')).toEqual([])
  })
  it('toDateKey usa i componenti locali, non UTC', () => {
    // 1 gennaio a mezzanotte in un fuso ovest sarebbe ancora 31/12 in UTC
    const d = new Date(2026, 0, 1, 0, 30, 0)
    expect(toDateKey(d)).toBe('2026-01-01')
  })
  it('isToday confronta con oggi locale', () => {
    expect(isToday(todayKey())).toBe(true)
    expect(isToday('1999-12-25')).toBe(false)
  })
})
