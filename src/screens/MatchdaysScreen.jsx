import React, { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { isAuctionComplete } from '../state/selectors'
import { Button, Card, Empty, PageTitle, SteppedList } from '../ui/parts'
import { dateRange, formatDate, isToday, scheduleForDate } from '../lib/schedule'
import { simulateMatchday } from '../lib/sim'
import DayCard from './DayCard'

export default function MatchdaysScreen({ onNavigate, onBack }) {
  const { state, update } = useApp()
  const { teams, players, config } = state
  const dates = useMemo(() => dateRange(config.startDate, config.endDate), [config.startDate, config.endDate])
  const today = new Date().toISOString().slice(0, 10)
  const [selected, setSelected] = useState(dates.includes(today) ? today : dates[0])

  if (teams.length < 2 || players.length === 0) {
    return (
      <main>
        <PageTitle title="Giornate" onBack={onBack} />
        <Card><Empty>Prima completa impostazioni, giocatori e asta.</Empty></Card>
      </main>
    )
  }

  if (!selected) {
    return (
      <main>
        <PageTitle title="Giornate" onBack={onBack} />
        <Card><Empty>Imposta prima le date del calendario nelle Impostazioni.</Empty></Card>
      </main>
    )
  }

  const dayIndex = dates.indexOf(selected)

  const compute = () => update((s) => {
    const lineups = {}
    s.teams.forEach((t) => {
      const chosen = s.lineups[selected]?.[t.id] ?? previousLineup(s, selected, t.id)
      lineups[t.id] = chosen.slice(0, s.config.formationSize)
    })
    const incomplete = s.teams.filter((t) => lineups[t.id].length < s.config.formationSize)
    if (incomplete.length && !confirm(`Attenzione: queste squadre non hanno la formazione completa: ${incomplete.map((t) => t.name).join(', ')}. Calcolare comunque?`)) {
      return s
    }
    const result = simulateMatchday({ config: s.config, teams: s.teams, players: s.players, events: s.events, dateKey: selected, lineups })
    return { ...s, results: { ...s.results, [selected]: result } }
  })

  const removeResult = () => update((s) => {
    const rest = { ...s.results }
    delete rest[selected]
    return { ...s, results: rest }
  })

  const result = state.results[selected]
  const pairs = scheduleForDate(teams.map((t) => t.id), selected, dayIndex)

  return (
    <main>
      <PageTitle
        title="Giornate"
        subtitle={`Ogni giorno reale è una giornata. Chi calcola: ${config.host || 'da definire nelle Impostazioni'}`}
        onBack={onBack}
      />

      {!isAuctionComplete(state) && (
        <Card><p className="warn">L'asta non è ancora terminata: completa le squadre o termina l'asta.</p></Card>
      )}

      <Card title="Scegli la giornata">
        <div className="day-list">
          {dates.map((d) => (
            <button key={d} className={`day-nav ${isToday(d) ? 'today' : ''}`} aria-current={d === selected ? "true" : undefined} onClick={() => setSelected(d)}>
              {formatDate(d)}
            </button>
          ))}
        </div>
      </Card>

      <DayCard
        dateKey={selected}
        today={isToday(selected)}
        index={dayIndex}
        teams={teams}
        pairs={pairs}
        result={result}
        onCompute={compute}
        onRemove={removeResult}
      />

      <div className="btn-row">
        <Button variant="primary" onClick={() => onNavigate('standings')}>Vai alla classifica</Button>
      </div>

      <SteppedList current="matchdays" onGo={onNavigate} />
    </main>
  )
}

function previousLineup(s, dateKey, teamId) {
  const keys = Object.keys(s.lineups).filter((k) => k < dateKey).sort()
  for (let i = keys.length - 1; i >= 0; i--) {
    const prev = s.lineups[keys[i]]?.[teamId]
    if (prev && prev.length) return prev
  }
  return []
}
