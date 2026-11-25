import React, { useState } from 'react'
import { useStore, uid } from '../store'
import { Section, EmptyHint, Pill } from '../components'

export default function PlayersScreen({ onDone }) {
  const { state, update } = useStore()
  const [name, setName] = useState('')

  const teamName = (p) => state.teams.find((t) => t.id === p.teamId)?.name ?? null

  const add = () => {
    const n = name.trim()
    if (!n) return
    if (state.players.some((p) => p.name.toLowerCase() === n.toLowerCase())) {
      alert('Hai già inserito un familiare con questo nome.')
      return
    }
    update((s) => {
      s.players.push({ id: uid(), name: n, teamId: null })
      return s
    })
    setName('')
  }

  const rename = (id, v) => update((s) => {
    const p = s.players.find((x) => x.id === id)
    if (p) p.name = v
    return s
  })

  const remove = (id) => update((s) => {
    const p = s.players.find((x) => x.id === id)
    if (p && p.teamId) {
      const team = s.teams.find((t) => t.id === p.teamId)
      if (team) team.spent = Math.max(0, team.spent - (p.price ?? 0))
    }
    s.players = s.players.filter((x) => x.id !== id)
    return s
  })

  const release = (id) => update((s) => {
    const p = s.players.find((x) => x.id === id)
    if (p && p.teamId) {
      const team = s.teams.find((t) => t.id === p.teamId)
      if (team) team.spent = Math.max(0, team.spent - (p.price ?? 0))
      p.teamId = null
      p.price = undefined
    }
    return s
  })

  return (
    <>
      <Section title={`Familiari-giocatori (${state.players.length})`}>
        <div className="btn-row">
          <input
            className="input grow"
            value={name}
            placeholder="Nome del familiare (es. Mamma, Zio Pino…)"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button className="btn primary" onClick={add}>+ Aggiungi</button>
        </div>
        {state.players.length === 0 && (
          <EmptyHint icon="🎅">Inserisci qui i tuoi {state.config.formationSize * Math.max(1, state.teams.length)} familiari — io non ne invento nessuno.</EmptyHint>
        )}
        <div className="rows">
          {state.players.map((p, i) => (
            <div className="row" key={p.id}>
              <span className="idx">{i + 1}</span>
              <input className="input" value={p.name} onChange={(e) => rename(p.id, e.target.value)} />
              {teamName(p) ? (
                <>
                  <Pill tone="good">{teamName(p)}</Pill>
                  <button className="btn small ghost" onClick={() => release(p.id)}>Svincola</button>
                </>
              ) : (
                <Pill tone="muted">svincolato</Pill>
              )}
              <button className="btn danger ghost" onClick={(e) => { e.currentTarget.blur(); remove(p.id) }}>✕</button>
            </div>
          ))}
        </div>
        <div className="hint">Totale familiari: <strong>{state.players.length}</strong> — cancella o rinomina liberamente prima dell'asta.</div>
      </Section>
      {state.players.length > 0 && (
        <button className="btn primary continue" onClick={onDone}>Prossimo passo: bonus e malus ⭐</button>
      )}
    </>
  )
}
