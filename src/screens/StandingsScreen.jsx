import React from 'react'
import { useStore } from '../store'
import { Section, EmptyHint } from '../components'
import { dateRange, formatDate } from '../lib/schedule'

export default function StandingsScreen() {
  const { state } = useStore()
  const { teams, config } = state
  const dates = dateRange(config.startDate, config.endDate)
  const computed = dates.filter((d) => state.results[d])

  if (teams.length < 2) {
    return <EmptyHint icon="🏆">La classifica esiste quando ci sono almeno 2 squadre: dai un'occhiata al ⚙️ Setup.</EmptyHint>
  }

  const rows = teams
    .map((t) => {
      const played = computed.filter((d) => state.results[d]?.details?.[t.id])
      const pts = played.reduce((s, d) => s + (state.results[d].details[t.id]?.total ?? 0), 0)
      return { team: t, played: played.length, pts, avg: played.length ? pts / played.length : 0 }
    })
    .sort((a, b) => b.pts - a.pts)

  return (
    <>
      <Section title={`Classifica a punti — ${computed.length} ${computed.length === 1 ? 'giornata calcolata' : 'giornate calcolate'}`}>
        {computed.length === 0 ? (
          <EmptyHint icon="📅">Nessuna giornata ancora calcolata: l'host parte dalla scheda 📅 Giornate.</EmptyHint>
        ) : (
          <table className="table standings">
            <thead>
              <tr>
                <th>#</th><th>Squadra</th><th>Giornate</th><th>Punti</th><th>Media</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.team.id} className={i === 0 ? 'first' : ''}>
                  <td>{i === 0 ? '🥇' : i + 1}</td>
                  <td><strong>{r.team.name}</strong></td>
                  <td>{r.played}</td>
                  <td><strong>{r.pts}</strong></td>
                  <td>{r.avg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {computed.length > 0 && (
        <Section title="Risultati giornata per giornata">
          <div className="rows">
            {computed.map((d) => (
              <div className="row" key={d}>
                <strong className="date">{formatDate(d)}</strong>
                <span className="grow">
                  {[...teams]
                    .sort((a, b) => (state.results[d].details[b.id]?.total ?? 0) - (state.results[d].details[a.id]?.total ?? 0))
                    .map((t) => `${t.name} ${state.results[d].details[t.id]?.total ?? 0}`)
                    .join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
