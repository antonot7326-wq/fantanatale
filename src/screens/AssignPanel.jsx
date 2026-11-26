import React, { useState } from 'react'
import { useApp, newId } from '../state/store'
import { Button, Card, Empty, Pill, TextInput, Stepper } from '../ui/parts'
import { lineupFor } from '../lib/data'

export default function AssignPanel({ dateKey }) {
  const { state, update } = useApp()
  const rules = state.events
  const teamsWithLineup = state.teams.filter((t) => (state.lineups[dateKey]?.[t.id] ?? lineupFor(state, dateKey, t.id)).length > 0)

  const dayAssignments = state.assignments[dateKey] ?? {}

  const toggleRule = (playerId, rule) => update((s) => {
    const day = { ...(s.assignments[dateKey] ?? {}) }
    const list = [...(day[playerId] ?? [])]
    const idx = list.findIndex((x) => x.label === rule.label && x.points === rule.points)
    if (idx >= 0) list.splice(idx, 1)
    else list.push({ label: rule.label, points: rule.points })
    day[playerId] = list
    return { ...s, assignments: { ...s.assignments, [dateKey]: day } }
  })

  const addCustom = (playerId, label, points) => update((s) => {
    const day = { ...(s.assignments[dateKey] ?? {}) }
    const list = [...(day[playerId] ?? [])]
    list.push({ id: newId(), label: label.trim() || 'Bonus', points })
    day[playerId] = list
    return { ...s, assignments: { ...s.assignments, [dateKey]: day } }
  })

  const removeOne = (playerId, index) => update((s) => {
    const day = { ...(s.assignments[dateKey] ?? {}) }
    const list = [...(day[playerId] ?? [])]
    list.splice(index, 1)
    day[playerId] = list
    return { ...s, assignments: { ...s.assignments, [dateKey]: day } }
  })

  if (teamsWithLineup.length === 0) {
    return (
      <Card title="Bonus e malus della giornata">
        <Empty>Nessuna formazione per questo giorno: scegline una con «Scegli le formazioni».</Empty>
      </Card>
    )
  }

  return (
    <Card title="Chi prende bonus e malus">
      <p className="note">
        Tocca una regola per assegnarla o toglierla a quel giocatore. Niente è casuale: decidi tu.
      </p>
      {teamsWithLineup.map((team) => {
        const ids = state.lineups[dateKey]?.[team.id] ?? lineupFor(state, dateKey, team.id)
        return (
          <div key={team.id} className="assign-team">
            <h3>{team.name}</h3>
            {ids.map((pid) => {
              const player = state.players.find((p) => p.id === pid)
              if (!player) return null
              const assigned = dayAssignments[pid] ?? []
              const sum = assigned.reduce((s, x) => s + (Number(x.points) || 0), 0)
              return (
                <div className="assign-player" key={pid}>
                  <div className="assign-head">
                    <strong>{player.name}</strong>
                    {assigned.length > 0 && (
                      <Pill tone={sum >= 0 ? 'good' : 'bad'}>
                        {sum > 0 ? '+' : ''}{sum} da bonus/malus
                      </Pill>
                    )}
                  </div>
                  {assigned.map((x, i) => (
                    <span key={i} className={`ev ${x.points >= 0 ? 'ev-plus' : 'ev-minus'}`}>
                      {x.label} ({x.points > 0 ? '+' : ''}{x.points})
                      <button
                        type="button"
                        className="ev-x"
                        aria-label={`Togli ${x.label} a ${player.name}`}
                        onClick={() => removeOne(pid, i)}
                      >×</button>
                    </span>
                  ))}
                  {rules.map((rule) => {
                    const on = assigned.some((x) => x.label === rule.label && x.points === rule.points)
                    return (
                      <button
                        key={rule.id}
                        type="button"
                        className={`chip chip-small ${rule.points >= 0 ? 'chip-good' : 'chip-bad'}`}
                        aria-pressed={on}
                        onClick={() => toggleRule(pid, rule)}
                      >
                        {rule.label} {rule.points > 0 ? '+' : ''}{rule.points}
                      </button>
                    )
                  })}
                  <CustomAdd onAdd={(label, points) => addCustom(pid, label, points)} />
                </div>
              )
            })}
          </div>
        )
      })}
    </Card>
  )
}

function CustomAdd({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [points, setPoints] = useState(3)
  if (!open) {
    return (
      <button type="button" className="chip chip-small" onClick={() => setOpen(true)}>
        Altro…
      </button>
    )
  }
  return (
    <span className="custom-add">
      <TextInput
        value={label}
        placeholder="Motivo"
        onChange={setLabel}
        style={{ maxWidth: '9rem' }}
      />
      <Stepper label="punti" value={points} min={-30} max={30} step={1} onChange={(e) => setPoints(Number(e.target.value))} />
      <Button
        variant="primary"
        onClick={() => {
          onAdd(label, points)
          setLabel('')
          setOpen(false)
        }}
      >
        Ok
      </Button>
    </span>
  )
}
