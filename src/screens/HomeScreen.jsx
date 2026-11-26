import React from 'react'
import { useApp } from '../state/store'
import { creditsLeft } from '../state/selectors'
import { Card, Pill, Button } from '../ui/parts'
import { dateRange, formatDate, isToday, scheduleForDate } from '../lib/schedule'

export default function HomeScreen({ onNavigate }) {
  const { state } = useApp()
  const { config, teams, players, results } = state
  const dates = dateRange(config.startDate, config.endDate)
  const today = new Date().toISOString().slice(0, 10)
  const computed = dates.filter((d) => results[d])
  const nextDate = dates.find((d) => !results[d]) ?? null
  const dayIndex = nextDate ? dates.indexOf(nextDate) : -1
  const pairs = nextDate && teams.length >= 2 ? scheduleForDate(teams.map((t) => t.id), nextDate, dayIndex) : []
  const auctionReady = teams.length >= 2 && players.length > 0

  return (
    <main className="tab-page">
      <div className="page-head">
        <h1>{config.name || 'FantaNatale'}</h1>
        <p>
          {config.host ? `Giornate calcolate da ${config.host}` : 'Imposta chi calcola le giornate'}
          {' · '}{formatDate(config.startDate)} – {formatDate(config.endDate)}
        </p>
      </div>

      <Card title="Prossima giornata" actions={nextDate && isToday(nextDate) ? <Pill tone="gold">oggi</Pill> : null}>
        {!nextDate ? (
          <p className="note">Tutte le giornate sono state calcolate: la lega è finita.</p>
        ) : teams.length < 2 ? (
          <p className="note">Crea almeno due squadre nelle Impostazioni per vedere gli abbinamenti.</p>
        ) : (
          <>
            <p className="next-date">{formatDate(nextDate)}</p>
            <div className="match-list">
              {pairs.map(([homeId, awayId], i) => (
                <div className="match" key={i}>
                  <span className="side">{teams.find((t) => t.id === homeId)?.name ?? '—'}</span>
                  <span className="score vs">vs</span>
                  <span className="side right">{awayId ? (teams.find((t) => t.id === awayId)?.name ?? '—') : 'riposo'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <div className="quick-actions">
        {!state.auctionDone && auctionReady && (
          <Button variant="primary" size="big" onClick={() => onNavigate('auction')}>
            {isAuctionComplete(state) ? 'Riprendi l’asta' : 'Fai l’asta'}
          </Button>
        )}
        <Button size="big" onClick={() => onNavigate('lineups')}>
          Scegli le formazioni
        </Button>
        {nextDate && (
          <Button size="big" onClick={() => onNavigate('matchdays')}>
            Vai alle giornate
          </Button>
        )}
      </div>

      {computed.length > 0 && (
        <Card title="Stato della lega">
          <p className="note">
            {computed.length} {computed.length === 1 ? 'giornata calcolata' : 'giornate calcolate'} su {dates.length}
            {players.length ? ` · ${players.length} giocatori in giro` : ''}
          </p>
        </Card>
      )}

      {!auctionReady && (
        <Card title="Da fare per iniziare">
          <p className="note">
            {teams.length < 2 ? 'Crea le squadre' : 'Aggiungi i giocatori'} e poi fai l’asta.
            Tocca l’ingranaggio in alto a destra per le Impostazioni.
          </p>
          <div className="btn-row">
            <Button onClick={() => onNavigate('setup')}>Apri Impostazioni</Button>
          </div>
        </Card>
      )}

      {creditsSummary(state)}
    </main>
  )
}

function creditsSummary(state) {
  if (!state.auctionDone || state.teams.length === 0) return null
  const rows = state.teams.map((t) => ({ name: t.name, left: creditsLeft(state, t) }))
  return (
    <Card title="Crediti rimasti">
      <div className="team-credits">
        {rows.map((r) => (
          <div className="team-card" key={r.name}>
            <div className="name">{r.name}</div>
            <div className="credits">{r.left}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
