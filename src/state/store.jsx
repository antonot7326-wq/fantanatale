import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'fantanatale-v1'

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function defaultConfig() {
  return {
    name: 'FantaNatale',
    host: '',
    budget: 500,
    formationSize: 4,
    minPoints: 40,
    maxPoints: 100,
    startDate: '2025-12-24',
    endDate: '2026-01-06',
  }
}

function defaultState() {
  return {
    config: defaultConfig(),
    players: [],
    teams: [],
    events: [],
    lineups: {},
    results: {},
    auctionLot: null,
    auctionDone: false,
  }
}

export function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  return {
    config: { ...base.config, ...(raw.config ?? {}) },
    players: Array.isArray(raw.players) ? raw.players : [],
    teams: Array.isArray(raw.teams) ? raw.teams : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    lineups: raw.lineups && typeof raw.lineups === 'object' ? raw.lineups : {},
    results: raw.results && typeof raw.results === 'object' ? raw.results : {},
    auctionLot: raw.auctionLot ?? null,
    auctionDone: Boolean(raw.auctionDone),
  }
}

const StateCtx = createContext(null)

export function StateProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return normalizeState(JSON.parse(saved))
    } catch {
      /* dati corrotti o storage bloccato: si parte da vuoto */
    }
    return defaultState()
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* memoria piena: i dati restano validi solo per la sessione */
    }
  }, [state])

  const value = useMemo(() => {
    const update = (fn) => setState((prev) => fn(structuredClone(prev)))
    return {
      state,
      update,
      resetAll: () => setState(defaultState()),
      replaceState: (raw) => setState(normalizeState(raw)),
    }
  }, [state])

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>
}

export function useApp() {
  return useContext(StateCtx)
}
