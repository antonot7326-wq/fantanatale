import React, { useState } from 'react'
import { useApp, newId } from '../state/store'
import { creditsLeft, playersOfTeam } from '../state/selectors'
import { Button, Card, Empty, Pill, TextInput, Stepper, StepperField } from '../ui/parts'
import { useDialog } from '../ui/dialog'

export default function RoseScreen() {
  const { state, update } = useApp()
  const dialog = useDialog()
  const { teams, players } = state

  const add = async (name) => {
    const clean = name.trim()
    if (!clean) return
    if (players.some((p) => p.name.trim().toLowerCase() === clean.toLowerCase())) {
      dialog.alert('Questo nome esiste già.')
      return
    }
    update((s) => ({ ...s, players: [...s.players, { id: newId(), name: clean, teamId: null, strength: 5 }] }))
  }

  const rename = (id, value) => {
    const clean = value.trim()
    if (!clean) {
      dialog.alert('Il nome del giocatore non può restare vuoto.')
      return
    }
    if (players.some((p) => p.id !== id && p.name.trim().toLowerCase() === clean.toLowerCase())) {
      dialog.alert('Esiste già un giocatore con questo nome.')
      return
    }
    update((s) => ({ ...s, players: s.players.map((p) => (p.id === id ? { ...p, name: clean } : p)) }))
  }

  const setStrength = (id, value) => update((s) => ({
    ...s,
    players: s.players.map((p) => (p.id === id ? { ...p, strength: Math.min(10, Math.max(1, Math.round(Number(value)) || 5)) } : p)),
  }))

  // Elimina un giocatore pulendo ogni riferimento (B6)
  const remove = async (id) => {
    const player = state.players.find((p) => p.id === id)
    if (!player) return
    const inTeam = Boolean(player.teamId)
    const ok = await dialog.confirm(
      inTeam
        ? `Eliminare ${player.name}? I crediti spesi tornano alla squadra e sparisce da formazioni e giornate.`
        : `Eliminare ${player.name}?`,
      { danger: true, confirmLabel: 'Elimina' },
    )
    if (!ok) return
    update((s) => {
      const p = s.players.find((x) => x.id === id)
      let teams = s.teams
      if (p?.teamId) {
        teams = s.teams.map((t) => (t.id === p.teamId ? { ...t, spent: Math.max(0, t.spent - (p.price ?? 0)) } : t))
      }
      const lineups = Object.fromEntries(
        Object.entries(s.lineups).map(([day, per]) => [
          day,
          Object.fromEntries(
            Object.entries(per).map(([tid, ids]) => [tid, (ids ?? []).filter((pid) => pid !== id)]),
          ),
        ]),
      )
      const assignments = Object.fromEntries(
        Object.entries(s.assignments).map(([day, per]) => {
          const next = { ...per }
          delete next[id]
          return [day, next]
        }),
      )
      return {
        ...s,
        teams,
        players: s.players.filter((x) => x.id !== id),
        lineups,
        assignments,
        auctionLot: s.auctionLot?.playerId === id ? null : s.auctionLot,
      }
    })
  }

  const release = async (id) => {
    const player = state.players.find((p) => p.id === id)
    if (!player?.teamId) return
    const ok = await dialog.confirm(`Mettere ${player.name} di nuovo libero? I crediti tornano alla squadra.`, {
      confirmLabel: 'Libera',
    })
    if (!ok) return
    update((s) => {
      const lineups = Object.fromEntries(
        Object.entries(s.lineups).map(([day, per]) => [
          day,
          Object.fromEntries(
            Object.entries(per).map(([tid, ids]) => [tid, (ids ?? []).filter((pid) => pid !== id)]),
          ),
        ]),
      )
      const assignments = Object.fromEntries(
        Object.entries(s.assignments).map(([day, per]) => {
          const next = { ...per }
          delete next[id]
          return [day, next]
        }),
      )
      return {
        ...s,
        teams: s.teams.map((t) => (t.id === player.teamId ? { ...t, spent: Math.max(0, t.spent - (player.price ?? 0)) } : t)),
        players: s.players.map((p) => (p.id === id ? { ...p, teamId: null, price: undefined } : p)),
        lineups,
        assignments,
        auctionLot: s.auctionLot?.playerId === id ? null : s.auctionLot,
      }
    })
  }

  const free = players.filter((p) => !p.teamId)

  return (
    <main>
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
                <TextInput className="grow" value={p.name} onChange={(value) => rename(p.id, value)} aria-label="Nome giocatore" />
                <Pill tone="muted">libero</Pill>
                <Button variant="danger" onClick={() => remove(p.id)}>Elimina</Button>
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
                    <TextInput className="grow" value={p.name} onChange={(value) => rename(p.id, value)} aria-label="Nome giocatore" />
                    {p.price != null && <Pill tone="good">{p.price} cr</Pill>}
                    <StepperField label="Forza">
                      <Stepper
                        label={`forza di ${p.name}`}
                        value={p.strength ?? 5}
                        min={1}
                        max={10}
                        onChange={(value) => setStrength(p.id, value)}
                      />
                    </StepperField>
                    <Button variant="ghost" onClick={() => release(p.id)}>Libera</Button>
                    <Button variant="danger" onClick={() => remove(p.id)}>Elimina</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}

      <p className="note">
        La forza (da 1 a 10) sposta i punti base: un giocatore forte prende in media più punti,
        e quindi all'asta vale di più. Tutti partono da forza 5.
      </p>
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
