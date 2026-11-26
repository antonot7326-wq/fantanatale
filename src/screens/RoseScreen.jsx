import React, { useState } from 'react'
import { useApp, newId } from '../state/store'
import { creditsLeft, playersOfTeam } from '../state/selectors'
import { Button, Card, Empty, Pill, TextInput } from '../ui/parts'

export default function RoseScreen() {
  const { state, update } = useApp()
  const { teams, players } = state

  const add = (name) => update((s) => {
    const clean = name.trim()
    if (!clean) return s
    if (s.players.some((p) => p.name.toLowerCase() === clean.toLowerCase())) {
      alert('Questo nome esiste già.')
      return s
    }
    return { ...s, players: [...s.players, { id: newId(), name: clean, teamId: null }] }
  })

  const rename = (id, name) => update((s) => ({ ...s, players: s.players.map((p) => (p.id === id ? { ...p, name } : p)) }))

  const remove = (id) => update((s) => {
    const player = s.players.find((p) => p.id === id)
    if (player?.teamId) {
      const team = s.teams.find((t) => t.id === player.teamId)
      if (team) team.spent = Math.max(0, team.spent - (player.price ?? 0))
    }
    return { ...s, players: s.players.filter((p) => p.id !== id) }
  })

  const release = (id) => update((s) => {
    const player = s.players.find((p) => p.id === id)
    if (!player?.teamId) return s
    const team = s.teams.find((t) => t.id === player.teamId)
    if (team) team.spent = Math.max(0, team.spent - (player.price ?? 0))
    return { ...s, players: s.players.map((p) => (p.id === id ? { ...p, teamId: null, price: undefined } : p)) }
  })

  const free = players.filter((p) => !p.teamId)

  return (
    <main className="tab-page">
      <div className="page-head">
        <h1>Rose</h1>
        <p>Chi è libero va all’asta; chi ha una squadra è già ingaggiato</p>
      </div>

      <Card title={`Senza squadra (${free.length})`}>
        <NewPlayerRow onAdd={add} />
        {players.length === 0 && (
          <Empty>Nessun giocatore: aggiungi qui i tuoi familiari, uno per volta.</Empty>
        )}
        {free.length > 0 && (
          <div className="rows">
            {free.map((p) => (
              <div className="row" key={p.id}>
                <TextInput className="grow" value={p.name} onChange={(e) => rename(p.id, e.target.value)} />
                <Pill tone="muted">libero</Pill>
                <Button variant="danger" onClick={() => {
                  if (confirm(`Eliminare ${p.name}?`)) remove(p.id)
                }}>Elimina</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {teams.map((team) => {
        const roster = playersOfTeam(state, team.id)
        return (
          <Card
            key={team.id}
            title={team.name}
            actions={
              <span className="team-meta">
                {roster.length} giocatori · {creditsLeft(state, team)} crediti rimasti
              </span>
            }
          >
            {roster.length === 0 ? (
              <Empty>Nessun giocatore: passa dall’asta per acquistarne.</Empty>
            ) : (
              <div className="rows">
                {roster.map((p) => (
                  <div className="row" key={p.id}>
                    <TextInput className="grow" value={p.name} onChange={(e) => rename(p.id, e.target.value)} />
                    {p.price != null && <Pill tone="good">{p.price} cr</Pill>}
                    <Button variant="ghost" onClick={() => {
                      if (confirm(`Mettere ${p.name} di nuovo libero? I crediti tornano alla squadra.`)) release(p.id)
                    }}>Libera</Button>
                    <Button variant="danger" onClick={() => remove(p.id)}>Elimina</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </main>
  )
}

function NewPlayerRow({ onAdd }) {
  const [name, setName] = useState('')
  const submit = () => {
    onAdd(name)
    setName('')
  }
  return (
    <div className="form-row">
      <TextInput
        className="grow"
        value={name}
        placeholder="Scrivi il nome del familiare"
        onChange={setName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
        }}
      />
      <Button variant="primary" onClick={submit}>
        Aggiungi giocatore
      </Button>
    </div>
  )
}
