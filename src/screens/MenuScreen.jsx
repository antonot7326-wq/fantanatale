import React from 'react'
import { useApp } from '../state/store'
import { SCREENS } from '../state/selectors'

export default function MenuScreen({ onNavigate }) {
  const { state } = useApp()
  const { config, players, teams, events, results } = state

  const labels = {
    setup: teams.length >= 2 && config.host ? 'completato' : 'da fare',
    players: players.length ? 'completato' : 'da fare',
    rules: events.length ? 'completato' : 'da fare',
    auction: state.auctionDone ? 'completato' : 'da fare',
    lineups: Object.keys(state.lineups).length ? 'completato' : 'da fare',
    matchdays: Object.keys(results).length ? 'in corso' : 'da fare',
    standings: Object.keys(results).length ? 'giornate calcolate' : 'da fare',
  }

  return (
    <main>
      <p className="note" style={{ marginTop: '1rem' }}>
        Menu principale: segui le voci in ordine per organizzare la lega.
      </p>
      <nav className="menu" aria-label="Menu principale">
        {SCREENS.map((s) => (
          <button key={s.id} className="menu-tile" onClick={() => onNavigate(s.id)}>
            {s.label}
            <span className="hint">
              {s.hint} — {labels[s.id]}
            </span>
          </button>
        ))}
      </nav>
    </main>
  )
}
