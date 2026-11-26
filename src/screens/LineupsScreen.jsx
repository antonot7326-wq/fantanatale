import React, { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { playersOfTeam } from '../state/selectors'
import { lineupFor } from '../lib/data'
import { Button, Card, Empty, Pill, PageTitle } from '../ui/parts'
import { useDialog } from '../ui/dialog'
import { dateRange, formatDate, isToday, todayKey } from '../lib/schedule'

export default function LineupsScreen({ onNavigate, onBack }) {
  const { state, update } = useApp()
  const dialog = useDialog()
  const { teams, players, config } = state
  const dates = useMemo(() => dateRange(config.startDate, config.endDate), [config.startDate, config.endDate])
  const today = todayKey()
  const [requested, setSelected] = useState(dates.includes(today) ? today : dates[0])
  const selected = dates.includes(requested) ? requested : (dates[0] ?? '')

  if (teams.length < 2 || players.length === 0) {
    return (
      <main>
        <PageTitle title="Formazioni" onBack={onBack} />
        <Card><Empty>Prima completa impostazioni, giocatori e asta.</Empty></Card>
      </main>
    )
  }

  if (!selected) {
    return (
      <main>
        <PageTitle title="Formazioni" onBack={onBack} />
        <Card><Empty>Imposta prima le date del calendario nelle Impostazioni.</Empty></Card>
      </main>
    )
  }

  const locked = Boolean(state.results[selected])

  // La formazione di partenza è quella ereditata (B3): il primo clic modifica
  // la formazione che vedi in campo, non la azzera.
  const toggle = async (teamId, playerId) => {
    if (locked) return
    const current = lineupFor(state, selected, teamId)
    if (!current.includes(playerId) && current.length >= config.formationSize) {
      dialog.alert(`Massimo ${config.formationSize} giocatori. Modifica il numero nelle Impostazioni se serve.`, { title: 'Formazione completa' })
      return
    }
    update((s) => {
      const next = current.includes(playerId)
        ? current.filter((x) => x !== playerId)
        : [...current, playerId]
      return { ...s, lineups: { ...s.lineups, [selected]: { ...(s.lineups[selected] ?? {}), [teamId]: next } } }
    })
  }

  const copyPrevious = async (teamId) => {
    const inherited = lineupFor(state, selected, teamId)
    if (!inherited.length) {
      dialog.alert('Non c’è nessuna formazione precedente da copiare.')
      return
    }
    update((s) => ({ ...s, lineups: { ...s.lineups, [selected]: { ...(s.lineups[selected] ?? {}), [teamId]: [...inherited] } } }))
  }

  return (
    <main>
      <PageTitle title="Formazioni" subtitle="Scegli i giocatori schierati, giornata per giornata" onBack={onBack} />

      <Card title="Scegli la giornata">
        {locked ? <Pill tone="muted">giornata già calcolata: solo lettura</Pill> : <Pill tone="good">puoi modificare</Pill>}
        <div className="day-list">
          {dates.map((d) => (
            <button key={d} className={`day-nav ${isToday(d) ? 'today' : ''}`} aria-current={d === selected ? "true" : undefined} onClick={() => setSelected(d)}>
              {formatDate(d)}
            </button>
          ))}
        </div>
      </Card>

      {teams.map((team) => (
        <TeamLineup
          key={team.id}
          team={team}
          selectedDay={selected}
          locked={locked}
          onToggle={toggle}
          onCopy={copyPrevious}
        />
      ))}

      <div className="btn-row">
        <Button variant="primary" onClick={() => onNavigate('matchdays')}>Vai alle giornate</Button>
      </div>
    </main>
  )
}

function TeamLineup({ team, selectedDay, locked, onToggle, onCopy }) {
  const { state } = useApp()
  const roster = playersOfTeam(state, team.id)
  const chosen = lineupFor(state, selectedDay, team.id)
  const inherited = !state.lineups[selectedDay]?.[team.id]?.length && chosen.length > 0

  return (
    <Card
      title={`${team.name}: scelti ${chosen.length} su ${state.config.formationSize}`}
      actions={!locked && <Button variant="ghost" onClick={() => onCopy(team.id)}>Copia dalla giornata precedente</Button>}
    >
      {inherited && <Pill tone="muted">stessa formazione della giornata precedente</Pill>}
      {roster.length === 0 ? (
        <Empty>Questa squadra non ha ancora giocatori: passa dall'asta.</Empty>
      ) : (
        <div className="chips">
          {roster.map((p) => (
            <button
              key={p.id}
              className="chip"
              aria-pressed={chosen.includes(p.id)}
              disabled={locked}
              onClick={() => onToggle(team.id, p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}
