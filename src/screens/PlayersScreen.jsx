import React from 'react'
import { useApp, newId } from '../state/store'
import { Button, Card, TextInput, Pill, Empty, PageTitle, SteppedList } from '../ui/parts'

export default function PlayersScreen({ onNavigate, onBack }) {
  const { state, update } = useApp()

  const teamName = (player) => state.teams.find((t) => t.id === player.teamId)?.name

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

  return (
    <main>
      <PageTitle
        title="Giocatori"
        subtitle="Qui vanno i nomi dei tuoi familiari: nessun nome è predefinito"
        onBack={onBack}
      />

      <Card title={`Elenco (${state.players.length})`}>
        <NewPlayerRow onAdd={add} />
        {state.players.length === 0 && (
          <Empty>Nessun giocatore. Aggiungi i tuoi familiari con il campo qui sopra.</Empty>
        )}
        <div className="rows">
          {state.players.map((p, i) => (
            <div className="row" key={p.id}>
              <span className="index">{i + 1}</span>
              <TextInput className="grow" value={p.name} onChange={(e) => rename(p.id, e.target.value)} />
              {teamName(p) ? (
                <>
                  <Pill tone="good">{teamName(p)}</Pill>
                  <Button variant="ghost" onClick={() => release(p.id)}>Libera</Button>
                </>
              ) : (
                <Pill tone="muted">libero</Pill>
              )}
              <Button variant="danger" onClick={() => remove(p.id)}>Elimina</Button>
            </div>
          ))}
        </div>
      </Card>

      <SteppedList current="players" onGo={onNavigate} />
    </main>
  )
}

function NewPlayerRow({ onAdd }) {
  const [name, setName] = React.useState('')
  return (
    <div className="form-row">
      <TextInput
        className="grow"
        value={name}
        placeholder="Scrivi il nome del familiare"
        onChange={setName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd(name)
            setName('')
          }
        }}
      />
      <Button variant="primary" onClick={() => { onAdd(name); setName('') }}>
        Aggiungi giocatore
      </Button>
    </div>
  )
}
