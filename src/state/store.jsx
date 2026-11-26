import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { pullState, pushState, syncConfigured } from '../lib/sync'

const STORAGE_KEY = 'fantanatale-v1'
const SCHEMA_VERSION = 1

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const clampInt = (v, min, max) => Math.min(max, Math.max(min, Math.round(Number(v) || min)))

export function nextChristmasRange() {
  const now = new Date()
  let year = now.getFullYear()
  if (now > new Date(`${year}-12-24T12:00:00`)) year += 1
  return { startDate: `${year}-12-24`, endDate: `${year + 1}-01-06` }
}

export function defaultConfig() {
  const { startDate, endDate } = nextChristmasRange()
  return {
    name: 'FantaNatale',
    host: '',
    budget: 500,
    formationSize: 4,
    rosterSize: 6,
    minPoints: 40,
    maxPoints: 100,
    startDate,
    endDate,
  }
}

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    config: defaultConfig(),
    players: [],
    teams: [],
    events: [],
    lineups: {},
    results: {},
    assignments: {},
    purchases: [],
    auctionLot: null,
    auctionDone: false,
    net: { url: '', room: '', enabled: false, role: 'admin' },
    rev: 0,
  }
}

const clamp = (v, min, max) => Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : min

// Rigorosa con i dati che entrano (remoto o file): scarta ciò che non è valido
// e completa ciò che manca, senza toccare ciò che esiste già in localStorage.
export function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base

  const net = raw.net && typeof raw.net === 'object' ? raw.net : {}
  const rawConfig = raw.config && typeof raw.config === 'object' ? raw.config : {}
  const formationSize = clampInt(rawConfig.formationSize ?? base.config.formationSize, 1, 12)
  const config = {
    ...base.config,
    ...rawConfig,
    formationSize,
    rosterSize: Math.max(formationSize, clampInt(rawConfig.rosterSize ?? Math.max(6, formationSize), 1, 30)),
    budget: clampInt(rawConfig.budget ?? base.config.budget, 0, 100000),
    minPoints: clampInt(rawConfig.minPoints ?? base.config.minPoints, 0, 999),
    maxPoints: clampInt(rawConfig.maxPoints ?? base.config.maxPoints, 1, 999),
  }
  if (config.maxPoints < config.minPoints) config.maxPoints = config.minPoints

  const idSeen = new Set()
  const players = (Array.isArray(raw.players) ? raw.players : [])
    .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string' && p.name.trim())
    .map((p) => ({
      id: p.id,
      name: p.name,
      teamId: typeof p.teamId === 'string' ? p.teamId : null,
      price: Number.isFinite(Number(p.price)) && p.teamId ? Number(p.price) : undefined,
      strength: clamp(p.strength ?? 5, 1, 10),
    }))
    .filter((p) => (idSeen.has(p.id) ? false : (idSeen.add(p.id), true)))
  const validPlayerIds = new Set(players.map((p) => p.id))

  const teams = (Array.isArray(raw.teams) ? raw.teams : [])
    .filter((t) => t && typeof t === 'object' && typeof t.id === 'string' && typeof t.name === 'string' && t.name.trim())
    .map((t) => ({ id: t.id, name: t.name, spent: Math.max(0, Number(t.spent) || 0) }))
    .filter((t) => (idSeen.has(t.id) ? false : (idSeen.add(t.id), true)))
  const validTeamIds = new Set(teams.map((t) => t.id))

  const events = (Array.isArray(raw.events) ? raw.events : [])
    .filter((e) => e && typeof e === 'object' && typeof e.label === 'string' && e.label.trim())
    .map((e) => ({ id: typeof e.id === 'string' ? e.id : newId(), label: e.label, points: clampInt(e.points ?? 0, -999, 999) }))

  const lineups = {}
  for (const [day, per] of Object.entries(raw.lineups && typeof raw.lineups === 'object' ? raw.lineups : {})) {
    if (!per || typeof per !== 'object') continue
    lineups[day] = {}
    for (const [teamId, ids] of Object.entries(per)) {
      if (!Array.isArray(ids) || !validTeamIds.has(teamId)) continue
      const clean = ids.filter((id) => typeof id === 'string' && validPlayerIds.has(id))
      if (clean.length) lineups[day][teamId] = clean
    }
  }

  const ruleByKey = new Map(events.map((e) => [`${e.label}|${e.points}`, e.id]))
  const assignments = {}
  for (const [day, per] of Object.entries(raw.assignments && typeof raw.assignments === 'object' ? raw.assignments : {})) {
    if (!per || typeof per !== 'object') continue
    assignments[day] = {}
    for (const [playerId, list] of Object.entries(per)) {
      if (!Array.isArray(list) || !validPlayerIds.has(playerId)) continue
      assignments[day][playerId] = list
        .filter((x) => x && typeof x === 'object' && typeof x.label === 'string')
        .map((x) => ({
          id: typeof x.id === 'string' ? x.id : newId(),
          ruleId: typeof x.ruleId === 'string'
            ? x.ruleId
            : ruleByKey.get(`${x.label}|${clampInt(x.points ?? 0, -999, 999)}`),
          label: x.label,
          points: clampInt(x.points ?? 0, -999, 999),
        }))
      if (!assignments[day][playerId].length) delete assignments[day][playerId]
    }
    if (!Object.keys(assignments[day]).length) delete assignments[day]
  }

  const results = {}
  for (const [day, result] of Object.entries(raw.results && typeof raw.results === 'object' ? raw.results : {})) {
    if (!result || typeof result !== 'object' || !result.details) continue
    const details = {}
    for (const [teamId, detail] of Object.entries(result.details)) {
      if (!detail || typeof detail !== 'object' || !Array.isArray(detail.players)) continue
      const players = detail.players
        .filter((x) => x && typeof x === 'object' && validPlayerIds.has(x.playerId))
        .map((x) => ({ playerId: x.playerId, name: String(x.name ?? ''), base: Number(x.base) || 0, ev: Array.isArray(x.ev) ? x.ev : [], total: Number(x.total) || 0 }))
      details[teamId] = { total: Number(detail.total) || players.reduce((s, x) => s + x.total, 0), players }
    }
    if (Object.keys(details).length) results[day] = { dateKey: day, computedAt: result.computedAt, pairs: Array.isArray(result.pairs) ? result.pairs : [], details }
  }

  const lot = raw.auctionLot && typeof raw.auctionLot === 'object' && validPlayerIds.has(raw.auctionLot.playerId)
    ? { playerId: raw.auctionLot.playerId, bid: Math.max(1, Number(raw.auctionLot.bid) || 1), bidderId: validTeamIds.has(raw.auctionLot.bidderId) ? raw.auctionLot.bidderId : null }
    : null

  const purchases = (Array.isArray(raw.purchases) ? raw.purchases : [])
    .filter((p) => p && typeof p === 'object' && validPlayerIds.has(p.playerId) && validTeamIds.has(p.teamId))
    .map((p) => ({ playerId: p.playerId, playerName: String(p.playerName ?? ''), teamId: p.teamId, price: Math.max(0, Number(p.price) || 0) }))

  return {
    schemaVersion: SCHEMA_VERSION,
    config,
    players,
    teams,
    events,
    lineups,
    results,
    assignments,
    purchases,
    auctionLot: lot,
    auctionDone: Boolean(raw.auctionDone),
    net: {
      url: typeof net.url === 'string' ? net.url : '',
      room: typeof net.room === 'string' ? net.room : '',
      enabled: Boolean(net.enabled),
      // Il ruolo è di questo telefono, non della lega: admin = tutto, guest = solo lettura.
      role: net.role === 'guest' ? 'guest' : 'admin',
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

  const [syncStatus, setSyncStatus] = useState(null) // { at, error }
  const stateRef = useRef(state)
  const applyingRemote = useRef(false)
  const pushInFlight = useRef(false)
  const pushTimer = useRef(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* memoria piena o storage bloccato: i dati restano validi per la sessione */
    }
    if (applyingRemote.current) return
    if (!state.net.enabled || !syncConfigured(state.net)) return
    // Gli ospiti leggono ma non scrivono mai sulla stanza.
    if (state.net.role === 'guest') return
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      pushInFlight.current = true
      pushState(state.net, state)
        .then(() => setSyncStatus({ at: Date.now(), error: null }))
        .catch((e) => setSyncStatus({ at: Date.now(), error: e.message }))
        .finally(() => {
          pushInFlight.current = false
        })
    }, 600)
    return () => clearTimeout(pushTimer.current)
  }, [state])

  useEffect(() => {
    if (!state.net.enabled || !syncConfigured(state.net)) return
    const interval = setInterval(async () => {
      if (document.hidden || pushInFlight.current || applyingRemote.current) return
      try {
        const remote = await pullState(state.net)
        if (!remote || !remote.rev || remote.rev <= stateRef.current.rev) return
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
        const next = fn(prev)
        if (!next || next === prev) return prev
        next.rev = Date.now()
        return next
      })
    return {
      state,
      update,
      syncStatus,
      resetAll: () => setState((prev) => ({ ...defaultState(), net: prev.net, rev: Date.now() })),
      // Da file o remoto: l'export non contiene la rete, quindi qui si tiene
      // la configurazione di rete di questo telefono e si invalida la rev (A8).
      replaceState: (raw) =>
        setState((prev) => ({ ...normalizeState(raw), net: prev.net, rev: Date.now() })),
    }
  }, [state, syncStatus])

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>
}

export function useApp() {
  return useContext(StateCtx)
}
