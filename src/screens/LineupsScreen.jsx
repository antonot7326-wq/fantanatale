import React, { useMemo, useState } from 'react'
import { useStore, lineupFor } from '../store'
import { Section, EmptyHint, Pill } from '../components'
import { dateRange, formatDate, isToday } from '../lib/schedule'

export default function LineupsScreen({ onDone }) {
  const { state, update } = useStore()
  const { teams, players, config } = state
  const dates = useMemo(() => dateRange(config.startDate, config.endDate), [config.startDate, config.endDate])
  const initialDate = dates.includes(new Date().toISOString().slice(0, 10)) ? new Date().toISOString().slice(0, 10) : dates[0]
  const [dateKey, setDateKey] = useState(initialDate)

  const computed = !!state.results[dateKey]
  const rosterOf = (teamId) => players.filter((p) => p.teamId === teamId)
  const chosen = (teamId) => state.lineups[dateKey]?.[teamId] ?? lineupFor(state, dateKey, teamId)
  const isCarried = (teamId) => !(state.lineups[dateKey]?.[teamId]?.length) && chosen(teamId).length > 0

  const toggle = (teamId, playerId) => update((s) => {
    if (!s.lineups[dateKey]) s.lineups[dateKey] = {}
    const cur = s.lineups[dateKey][teamId] ?? []
    const idx = cur.indexOf(playerId)
    if (idx >= 0) {
      cur.splice(idx, 1)
    } else {
      if (cur.length >= config.formationSize) {
        alert(`${config.formationSize} è il massimo di giocatori schierabili per squadra (modificabile nel Setup).`)
        return s
      }
      cur.push(playerId)
    }
    s.lineups[dateKey][teamId] = cur
    return s
  })

  const copyPrevious = (teamId, e) => {
    e?.stopPropagation()
    update((s) => {
      const keys = Object.keys(s.lineups).filter((k) => k < dateKey).sort()
      for (let i = keys.length - 1; i >= 0; i--) {
        const prev = s.lineups[keys[i]]?.[teamId]
        if (prev && prev.length) {
          if (!s.lineups[dateKey]) s.lineups[dateKey] = {}
          s.lineups[dateKey][teamId] = [...prev]
          return s
        }
      }
      alert('Nessuna formazione precedente da copiare.')
      return s
    })
  }

  if (teams.length < 2 || players.length === 0) {
    return <EmptyHint icon="📋">Prima completa ⚙️ Setup, 🎅 Familiari e 🔨 Asta.</EmptyHint>
  }

  return (
    <>
      <Section
        title="Seleziona la giornata"
        right={<Pill tone={computed ? 'good' : 'muted'}>{computed ? 'già calcolata — sola lettura' : 'modificabile'}</Pill>}
      >
        <div className="days">
          {dates.map((d) => (
            <button key={d} className={`day ${d === dateKey ? 'active' : ''} ${isToday(d) ? 'today' : ''}`} onClick={() => setDateKey(d)}>
              {formatDate(d)}
            </button>
          ))}
        </div>
      </Section>

      {teams.map((team) => {
        const sel = chosen(team.id)
        return (
          <Section
            key={team.id}
            title={`${team.name} — ${sel.length}/${config.formationSize}`}
            right={
              !computed && isCarried(team.id) ? (
                <Pill tone="muted">ereditata dalla giornata precedente</Pill>
              ) : null
            }
          >
            <div className="chips">
              {rosterOf(team.id).map((p) => (
                <button
                  key={p.id}
                  disabled={computed}
                  className={`chip ${sel.includes(p.id) ? 'on' : ''}`}
                  onClick={() => toggle(team.id, p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {rosterOf(team.id).length === 0 && (
              <div className="hint">Questa squadra non ha ancora giocatori: passa dalla scheda 🔨 Asta.</div>
            )}
            {!computed && (
              <div className="btn-row">
                <button className="btn small" onClick={(e) => copyPrevious(team.id, e)}>Copia dalla giornata precedente</button>
              </div>
            )}
          </Section>
        )
      })}

      <button className="btn primary continue" onClick={onDone}>Prossimo passo: giornate dell'host 📅</button>
    </>
  )
}
