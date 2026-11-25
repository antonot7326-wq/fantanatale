import React, { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { playersOfTeam } from '../state/selectors'
import { lineupFor } from '../lib/data'
import { Button, Card, Empty, Pill, PageTitle, SteppedList } from '../ui/parts'
import { dateRange, formatDate, isToday } from '../lib/schedule'

export default function LineupsScreen({ onNavigate, onBack }) {
  const { state, update } = useApp()
  const { teams, players, config } = state
  const dates = useMemo(() => dateRange(config.startDate, config.endDate), [config.startDate, config.endDate])
  const today = new Date().toISOString().slice(0, 10)
  const [selected, setSelected] = useState(dates.includes(today) ? today : dates[0])

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

  const toggle = (teamId, playerId) => update((s) => {
    const dayLineups = { ...(s.lineups[selected] ?? {}) }
    const current = dayLineups[teamId] ?? []
    if (current.includes(playerId)) {
      dayLineups[teamId] = current.filter((x) => x !== playerId)
    } else {
      if (current.length >= s.config.formationSize) {
        alert(`Massimo ${s.config.formationSize} giocatori. Modifica il numero nelle Impostazioni se serve.`)
        return s
      }
      dayLineups[teamId] = [...current, playerId]
    }
    return { ...s, lineups: { ...s.lineups, [selected]: dayLineups } }
  })

  const copyPrevious = (teamId) => update((s) => {
    const keys = Object.keys(s.lineups).filter((k) => k < selected).sort()
    for (let i = keys.length - 1; i >= 0; i--) {
      const prev = s.lineups[keys[i]]?.[teamId]
      if (prev && prev.length) {
        return { ...s, lineups: { ...s.lineups, [selected]: { ...(s.lineups[selected] ?? {}), [teamId]: [...prev] } } }
      }
    }
    alert('Non c\u2019\u00e8 nessuna formazione precedente da copiare.')
    return s
  })

  return (
    <main>
      <PageTitle title="Formazioni" subtitle="Scegli i giocatori schierati, giornata per giornata" onBack={onBack} />

      <Card title="Scegli la giornata">
        {locked ? <Pill tone="muted">giornata già calcolata: solo lettura</Pill> : <Pill tone="good">puoi modificare</Pill>}
        <div className="day-list">
          {dates.map((d) => (
            <button key={d} className={`day-nav ${isToday(d) ? 'today' : ''}`} aria-current={d === selected} onClick={() => setSelected(d)}>
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

      <SteppedList current="lineups" onGo={onNavigate} />
    </main>
  )
}

function TeamLineup({ team, selectedDay, locked, onToggle, onCopy }) {
  const { state } = useApp()
  const roster = playersOfTeam(state, team.id)
  const chosen = state.lineups[selectedDay]?.[team.id] ?? lineupFor(state, selectedDay, team.id)
  const inherited = !state.lineups[selectedDay]?.[team.id] && chosen.length > 0

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
