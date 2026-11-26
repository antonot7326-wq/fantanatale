import React from 'react'
import { useApp } from '../state/store'
import { standings } from '../state/selectors'
import { Card, Empty, PageTitle } from '../ui/parts'
import { formatDate } from '../lib/schedule'

export default function StandingsScreen() {
  const { state } = useApp()
  const { teams } = state
  const { rows, computed } = standings(state)

  if (teams.length < 2) {
    return (
      <main>
        <PageTitle title="Classifica" />
        <Card><Empty>La classifica compare quando ci sono almeno due squadre.</Empty></Card>
      </main>
    )
  }

  return (
    <main>
      <PageTitle title="Classifica" subtitle={`${computed.length} giornate calcolate`} />

      <Card title="Punti totali">
        {computed.length === 0 ? (
          <Empty>Nessuna giornata calcolata: vai a Giornate e premi «Calcola giornata».</Empty>
        ) : (
          <>
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
                    <td><span className={`pos-badge ${i === 0 ? 'first' : ''}`}>{r.position}</span></td>
                    <td><strong>{r.team.name}</strong></td>
                    <td className="num">{r.played}</td>
                    <td className="num"><strong>{r.points}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="note">
              Regolamento: vince chi totalizza più punti nell'intero periodo. Le sfide del giorno mostrano
              chi supera chi, ma la classifica conta solo i punti. Chi riposa schiera comunque la formazione
              e prende i suoi punti.
            </p>
          </>
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
                    .join(' · ')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </main>
  )
}
