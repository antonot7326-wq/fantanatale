import React, { useMemo, useState } from 'react'
import { useStore, lineupFor } from '../store'
import { Section, EmptyHint, Pill } from '../components'
import { dateRange, formatDate, isToday, scheduleForDate } from '../lib/schedule'
import { simulateMatchday } from '../lib/sim'

export default function MatchdaysScreen({ onDone }) {
  const { state, update } = useStore()
  const { teams, players, config } = state
  const [open, setOpen] = useState(null)
  const dates = useMemo(() => dateRange(config.startDate, config.endDate), [config.startDate, config.endDate])
  const teamById = (id) => teams.find((t) => t.id === id)

  const compute = (dateKey) => update((s) => {
    const index = dateRange(s.config.startDate, s.config.endDate).indexOf(dateKey)
    const lineups = {}
    for (const team of s.teams) {
      lineups[team.id] = lineupFor(s, dateKey, team.id).slice(0, s.config.formationSize)
    }
    const incomplete = s.teams.filter((t) => (lineups[t.id] ?? []).length < s.config.formationSize)
    if (incomplete.length && !confirm(`Attenzione: ${incomplete.map((m) => m.name).join(', ')} non ha una formazione completa. Calcolare comunque?`)) return s
    s.results[dateKey] = simulateMatchday({ config: s.config, teams: s.teams, players: s.players, events: s.events, dateKey, lineups })
    return s
  })

  const deleteResult = (dateKey) => {
    if (confirm(`Annullare la giornata del ${formatDate(dateKey)}? I punteggi e la classifica torneranno indietro.`)) {
      update((s) => {
        delete s.results[dateKey]
        return s
      })
    }
  }

  if (teams.length < 2 || players.length === 0) {
    return <EmptyHint icon="📅">Prima completa ⚙️ Setup, 🎅 Familiari e 🔨 Asta.</EmptyHint>
  }
  if (dates.length === 0) {
    return <EmptyHint icon="📅">Imposta prima le date del periodo natalizio nel ⚙️ Setup.</EmptyHint>
  }

  return (
    <>
      <Section title={`Calendario natalizio — ${dates.length} giornate`}>
        <div className="hint">
          Ogni giorno vero è una giornata, calcolata dall'host{config.host ? ` (${config.host})` : ''}. I punteggi vanno
          direttamente in 🏆 Classifica e 🥇 Marcatori.
        </div>
      </Section>

      {dates.map((dateKey, index) => {
        const res = state.results[dateKey]
        const pairs = scheduleForDate(teams.map((t) => t.id), dateKey, index)
        const openDay = open === dateKey
        return (
          <section className={`card day-card ${isToday(dateKey) ? 'today' : ''}`} key={dateKey}>
            <div className="card-head">
              <h2 onClick={() => setOpen(openDay ? null : dateKey)} style={{ cursor: 'pointer' }}>
                {formatDate(dateKey)} {isToday(dateKey) && <span className="today-tag">oggi</span>}
              </h2>
              <div className="btn-row">
                {res ? (
                  <>
                    <Pill tone="good">calcolata</Pill>
                    <button className="btn small ghost" onClick={() => setOpen(openDay ? null : dateKey)}>
                      {openDay ? 'Chiudi' : 'Dettagli'}
                    </button>
                    <button className="btn small danger ghost" onClick={() => deleteResult(dateKey)}>Annulla</button>
                  </>
                ) : (
                  <>
                    <Pill tone="muted">da giocare</Pill>
                    <button className="btn small primary" onClick={() => compute(dateKey)}>Calcola giornata</button>
                  </>
                )}
              </div>
            </div>

            <div className="matches">
              {pairs.map(([a, b], i) => {
                const ta = teamById(a)
                const tb = b ? teamById(b) : null
                const da = res?.details?.[a]
                const db = b ? res?.details?.[b] : null
                if (!ta && !tb) return null
                return (
                  <div className="match" key={i}>
                    <span className={`side ${(da?.total ?? 0) > (db?.total ?? 0) ? 'win' : ''}`}>{ta?.name ?? '—'}</span>
                    <span className="score">
                      {res ? `${da?.total ?? 0} : ${db?.total ?? 0}` : '– : –'}
                    </span>
                    <span className={`side right ${(db?.total ?? 0) > (da?.total ?? 0) ? 'win' : ''}`}>{tb ? tb.name : (b === null ? 'riposa' : '—')}</span>
                  </div>
                )
              })}
            </div>

            {res && openDay && (
              <div className="details">
                {teams.map((t) => {
                  const d = res.details?.[t.id]
                  if (!d) return null
                  return (
                    <div className="detail-team" key={t.id}>
                      <h3>
                        {t.name} — {d.total} pt
                      </h3>
                      <table className="table">
                        <thead>
                          <tr><th>Giocatore</th><th>Base</th><th>Eventi</th><th>Totale</th></tr>
                        </thead>
                        <tbody>
                          {d.players.map((x) => (
                            <tr key={x.playerId}>
                              <td>{x.name}</td>
                              <td>{x.base}</td>
                              <td>
                                {x.ev.length === 0
                                  ? '—'
                                  : x.ev.map((e, i) => (
                                      <span key={i} className={`ev ${e.points >= 0 ? 'ev-plus' : 'ev-minus'}`}>
                                        {e.label} ({e.points > 0 ? '+' : ''}{e.points})
                                      </span>
                                    ))}
                              </td>
                              <td><strong>{x.total}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}

      <div className="btn-row continue">
        <button className="btn primary" onClick={onDone}>Vai alla classifica 🏆</button>
      </div>
    </>
  )
}
