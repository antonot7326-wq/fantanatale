import React from 'react'
import { useApp } from '../state/store'
import { standings } from '../state/selectors'
import { Card, Empty, Button, Pill } from '../ui/parts'
import { formatDate } from '../lib/schedule'

// Modalità ospite: solo il nome della lega e la classifica, aggiornata da sola.
// Nessuna modifica possibile: questo telefono non scrive mai sulla stanza.
export default function GuestScreen({ onExit }) {
  const { state, syncStatus } = useApp()
  const { rows, computed } = standings(state)

  return (
    <div className="app">
      <header className="topbar">
        <span className="topbar-logo" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.9 5.7H20l-4.7 3.5 1.8 5.8L12 13.5 6.9 17l1.8-5.8L4 7.7h6.1L12 2z" />
          </svg>
        </span>
        <div className="topbar-title">
          <h1>{state.config.name || 'FantaNatale'}</h1>
        </div>
        {syncStatus?.error ? <Pill tone="bad">offline</Pill> : <Pill tone="good">aggiornata</Pill>}
      </header>

      <div className="content">
        <main>
          <Card title="Classifica">
            {state.teams.length < 2 ? (
              <Empty>La classifica compare quando l'organizzatore crea le squadre.</Empty>
            ) : computed.length === 0 ? (
              <Empty>Nessuna giornata calcolata: torna qui dopo che l'organizzatore l'ha calcolata.</Empty>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Posizione</th>
                    <th>Squadra</th>
                    <th className="num">Punti</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.team.id} className={i === 0 ? 'row-first' : ''}>
                      <td><span className={`pos-badge ${i === 0 ? 'first' : ''}`}>{r.position}</span></td>
                      <td><strong>{r.team.name}</strong></td>
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
                      {state.teams
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

          <div className="btn-row">
            <Button onClick={onExit}>Esci dalla modalità ospite</Button>
          </div>
        </main>
      </div>
    </div>
  )
}
