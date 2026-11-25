import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'fantanatale-v1'

export const uid = () =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`)

export const defaultConfig = () => ({
  name: 'FantaNatale',
  host: '',
  budget: 500,
  formationSize: 4,
  minPoints: 40,
  maxPoints: 100,
  startDate: '2025-12-24',
  endDate: '2026-01-06',
})

const defaultState = () => ({
  config: defaultConfig(),
  players: [],
  teams: [],
  events: [],
  lineups: {},
  results: {},
  auctionLot: null,
  auctionDone: false,
})

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...defaultState(), ...JSON.parse(raw) }
    } catch { /* localStorage non disponibile o dati corrotti: si parte puliti */ }
    return defaultState()
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* quota piena: i dati restano in memoria per questa sessione */ }
  }, [state])

  const value = useMemo(() => {
    const update = (fn) => setState((prev) => fn(structuredClone(prev)))
    return {
      state,
      update,
      resetAll: () => setState(defaultState()),
      importState: (data) => setState({ ...defaultState(), ...data }),
    }
  }, [state])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)

export const creditsLeft = (state, team) => state.config.budget - (team?.spent ?? 0)

export function playerById(state, id) {
  return state.players.find((p) => p.id === id) ?? null
}

export function lastLineupOf(state, teamId, beforeDateKey) {
  const keys = Object.keys(state.lineups).filter((k) => k < beforeDateKey).sort()
  for (let i = keys.length - 1; i >= 0; i--) {
    const l = state.lineups[keys[i]]?.[teamId]
    if (l && l.length) return l
  }
  return []
}

export function lineupFor(state, dateKey, teamId) {
  const own = state.lineups[dateKey]?.[teamId]
  if (own && own.length) return own
  return lastLineupOf(state, teamId, dateKey)
}
