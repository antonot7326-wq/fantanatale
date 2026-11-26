import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { pullState, pushState, syncConfigured } from '../lib/sync'

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
    assignments: {},
    auctionLot: null,
    auctionDone: false,
    net: { url: '', room: '', enabled: false },
    rev: 0,
  }
}

export function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const net = raw.net && typeof raw.net === 'object' ? raw.net : {}
  return {
    config: { ...base.config, ...(raw.config ?? {}) },
    players: Array.isArray(raw.players) ? raw.players : [],
    teams: Array.isArray(raw.teams) ? raw.teams : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    lineups: raw.lineups && typeof raw.lineups === 'object' ? raw.lineups : {},
    results: raw.results && typeof raw.results === 'object' ? raw.results : {},
    assignments:
      raw.assignments && typeof raw.assignments === 'object'
        ? Object.fromEntries(
            Object.entries(raw.assignments).map(([day, per]) => [
              day,
              per && typeof per === 'object' ? per : {},
            ]),
          )
        : {},
    auctionLot: raw.auctionLot ?? null,
    auctionDone: Boolean(raw.auctionDone),
    net: {
      url: typeof net.url === 'string' ? net.url : '',
      room: typeof net.room === 'string' ? net.room : '',
      enabled: Boolean(net.enabled),
    },
    rev: Number(raw.rev) || 0,
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

  const applyingRemote = useRef(false)
  const pushTimer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* memoria piena: i dati restano validi solo per la sessione */
    }
    if (applyingRemote.current) return
    if (!state.net.enabled || !syncConfigured(state.net)) return
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      pushState(state.net, state).catch(() => {})
    }, 600)
    return () => clearTimeout(pushTimer.current)
  }, [state])

  useEffect(() => {
    if (!state.net.enabled || !syncConfigured(state.net)) return
    const interval = setInterval(async () => {
      try {
        const remote = await pullState(state.net)
        if (!remote || !remote.rev || remote.rev <= state.rev) return
        applyingRemote.current = true
        setState(normalizeState(remote))
        setTimeout(() => {
          applyingRemote.current = false
        }, 300)
      } catch {
        /* rete assente: si continua in locale */
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [state.net.enabled, state.net.url, state.net.room])

  const value = useMemo(() => {
    const update = (fn) =>
      setState((prev) => {
        applyingRemote.current = false
        const next = fn(structuredClone(prev))
        next.rev = Date.now()
        return next
      })
    return {
      state,
      update,
      resetAll: () => setState({ ...defaultState(), net: state.net, rev: Date.now() }),
      replaceState: (raw) => setState(normalizeState(raw)),
    }
  }, [state])

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>
}

export function useApp() {
  return useContext(StateCtx)
}
