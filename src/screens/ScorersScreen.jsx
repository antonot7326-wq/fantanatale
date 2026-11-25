import React from 'react'
import { useStore } from '../store'
import { Section, EmptyHint } from '../components'
import { dateRange } from '../lib/schedule'

export default function ScorersScreen() {
  const { state } = useStore()
  const { players, teams, config } = state
  const dates = dateRange(config.startDate, config.endDate)
  const computed = dates.filter((d) => state.results[d])

  if (players.length === 0 || computed.length === 0) {
    return (
      <EmptyHint icon="🥇">
        Calcola almeno una giornata in 📅 per vedere la corsa a punti dei tuoi familiari.
      </EmptyHint>
    )
  }

  const rows = players
    .map((p) => {
      let apps = 0
      let total = 0
      let best = null
      const team = teams.find((t) => t.id === p.teamId)
      for (const d of computed) {
        const line = state.results[d]?.details?.[p.teamId]?.players?.find((x) => x.playerId === p.id)
        if (line) {
          apps += 1
          total += line.total
          if (best === null || line.total > best.total) best = { total: line.total, dateKey: d }
        }
      }
      return { player: p, teamName: team?.name ?? 'svincolato', apps, total, best }
    })
    .filter((r) => r.apps > 0)
    .sort((a, b) => b.total - a.total || b.best?.total - a.best?.total)

  return (
    <Section title={`Marcatori — punti totali dei familiari (${computed.length} ${computed.length === 1 ? 'giornata' : 'giornate'})`}>
      <table className="table standings">
        <thead>
          <tr><th>#</th><th>Familiare</th><th>Squadra</th><th>Presenze</th><th>Punti</th><th>Media</th><th>Miglior giornata</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.player.id} className={i === 0 ? 'first' : ''}>
              <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
              <td><strong>{r.player.name}</strong></td>
              <td>{r.teamName}</td>
              <td>{r.apps}</td>
              <td><strong>{r.total}</strong></td>
              <td>{(r.total / r.apps).toFixed(1)}</td>
              <td>{r.best ? r.best.total : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="hint">Senza ruoli: è la corsa a punti tra i familiari, giornata dopo giornata.</div>
    </Section>
  )
}
