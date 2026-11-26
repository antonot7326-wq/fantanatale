import React from 'react'
import { useApp } from '../state/store'
import { Card, Empty, PageTitle } from '../ui/parts'
import { dateRange, formatDate } from '../lib/schedule'

export default function StandingsScreen() {
  const { state } = useApp()
  const { teams, config } = state
  const dates = dateRange(config.startDate, config.endDate)
  const computed = dates.filter((d) => state.results[d])

  if (teams.length < 2) {
    return (
      <main>
        <PageTitle title="Classifica" />
        <Card><Empty>La classifica compare quando ci sono almeno due squadre.</Empty></Card>
      </main>
    )
  }

  const rows = teams
    .map((team) => {
      const played = computed.filter((d) => state.results[d]?.details?.[team.id])
      const points = played.reduce((sum, d) => sum + (state.results[d].details[team.id]?.total ?? 0), 0)
      return { team, played: played.length, points, average: played.length ? points / played.length : 0 }
    })
    .sort((a, b) => b.points - a.points)

  return (
    <main>
      <PageTitle title="Classifica" subtitle={`${computed.length} giornate calcolate`} />

      <Card title="Punti totali">
        {computed.length === 0 ? (
          <Empty>Nessuna giornata calcolata: vai a Giornate e premi «Calcola giornata».</Empty>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Posizione</th>
                <th>Squadra</th>
                <th className="num">Giocate</th>
                <th className="num">Punti</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.team.id} className={i === 0 ? 'row-first' : ''}>
                  <td><span className={`pos-badge ${i === 0 ? 'first' : ''}`}>{i + 1}</span></td>
                  <td><strong>{r.team.name}</strong></td>
                  <td className="num">{r.played}</td>
                  <td className="num"><strong>{r.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {computed.length > 0 && (
        <Card title="Risultati di ogni giornata">
          <div className="rows">
            {computed.map((d) => (
              <div className="row" key={d}>
                <strong className="index">{formatDate(d)}</strong>
                <span className="grow">
                  {teams
                    .slice()
                    .sort((a, b) => (state.results[d].details[b.id]?.total ?? 0) - (state.results[d].details[a.id]?.total ?? 0))
                    .map((t) => `${t.name} ${state.results[d].details[t.id]?.total ?? 0}`)
                    .join(' \u00b7 ')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </main>
  )
}
