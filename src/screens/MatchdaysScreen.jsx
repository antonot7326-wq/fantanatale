import React, { useMemo, useState } from 'react'
import { useApp } from '../state/store'
import { isAuctionComplete } from '../state/selectors'
import { Button, Card, Empty, PageTitle } from '../ui/parts'
import { useDialog } from '../ui/dialog'
import { dateRange, formatDate, isToday, todayKey, scheduleForDate } from '../lib/schedule'
import { lineupFor } from '../lib/data'
import { simulateMatchday } from '../lib/sim'
import DayCard from './DayCard'

export default function MatchdaysScreen({ onNavigate }) {
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
        <PageTitle title="Giornate" />
        <Card><Empty>Prima completa impostazioni, giocatori e asta.</Empty></Card>
      </main>
    )
  }

  if (!selected) {
    return (
      <main>
        <PageTitle title="Giornate" />
        <Card><Empty>Imposta prima le date del calendario nelle Impostazioni.</Empty></Card>
      </main>
    )
  }

  const dayIndex = dates.indexOf(selected)
  const pairs = scheduleForDate(teams.map((t) => t.id), selected, dayIndex)

  // Le verifiche e le domande stanno fuori dall'aggiornamento (A11)
  const compute = async () => {
    const incomplete = teams.filter((t) => lineupFor(state, selected, t.id).length < config.formationSize)
    if (incomplete.length) {
      const ok = await dialog.confirm(
        `Attenzione: queste squadre non hanno la formazione completa: ${incomplete.map((t) => t.name).join(', ')}. Calcolare comunque?`,
        { confirmLabel: 'Calcola comunque' },
      )
      if (!ok) return
    }
    update((s) => {
      const lineups = {}
      s.teams.forEach((t) => {
        lineups[t.id] = lineupFor(s, selected, t.id).slice(0, s.config.formationSize)
      })
      const result = simulateMatchday({
        config: s.config,
        teams: s.teams,
        players: s.players,
        dateKey: selected,
        lineups,
        assignments: s.assignments?.[selected] ?? {},
        pairs: scheduleForDate(s.teams.map((t) => t.id), selected, dayIndex),
      })
      return { ...s, results: { ...s.results, [selected]: result } }
    })
  }

  // Annulla la giornata ma conserva le assegnazioni dei bonus (B5)
  const removeResult = () => update((s) => {
    const rest = { ...s.results }
    delete rest[selected]
    return { ...s, results: rest }
  })

  const result = state.results[selected]

  return (
    <main>
      <PageTitle
        title="Giornate"
        subtitle={`Ogni giorno reale è una giornata. Chi calcola: ${config.host || 'da definire nelle Impostazioni'}`}
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
        teams={teams}
        pairs={pairs}
        result={result}
        onCompute={compute}
        onRemove={removeResult}
      />

      <div className="btn-row">
        <Button variant="ghost" onClick={() => onNavigate('lineups')}>Modifica formazioni</Button>
        <Button variant="primary" onClick={() => onNavigate('standings')}>Vai alla classifica</Button>
      </div>
    </main>
  )
}
