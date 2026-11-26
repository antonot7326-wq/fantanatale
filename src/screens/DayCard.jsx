import React, { useState } from 'react'
import { Button, Card, Pill } from '../ui/parts'
import { useDialog } from '../ui/dialog'
import { formatDate } from '../lib/schedule'
import AssignPanel from './AssignPanel'

export default function DayCard({ dateKey, today, teams, pairs, result, onCompute, onRemove }) {
  const [open, setOpen] = useState(false)
  const dialog = useDialog()
  const teamById = (id) => teams.find((t) => t.id === id)
  // Gli accoppiamenti salvati al calcolo restano la storia vera (B10)
  const dayPairs = result?.pairs?.length ? result.pairs : pairs

  return (
    <Card
      title={
        <>
          Giornata del {formatDate(dateKey)}
          {today && <span className="today-tag">oggi</span>}
        </>
      }
      actions={result ? <Pill tone="good">calcolata</Pill> : <Pill tone="muted">da giocare</Pill>}
    >
      <div>
        {dayPairs.map(([homeId, awayId], i) => {
          const home = teamById(homeId)
          const away = awayId ? teamById(awayId) : null
          if (!home && !away) return null
          const homeDetail = result?.details?.[homeId]
          const awayDetail = awayId ? result?.details?.[awayId] : null
          return (
            <div className="match" key={i}>
              <span className={`side ${(homeDetail?.total ?? 0) > (awayDetail?.total ?? 0) ? 'winner' : ''}`}>
                {home?.name ?? '—'}
              </span>
              <span className="score">{result ? `${homeDetail?.total ?? 0} — ${awayDetail?.total ?? 0}` : '—'}</span>
              <span className={`side right ${(awayDetail?.total ?? 0) > (homeDetail?.total ?? 0) ? 'winner' : ''}`}>
                {away ? away.name : 'riposo'}
              </span>
            </div>
          )
        })}
      </div>

      <AssignPanel dateKey={dateKey} />

      <div className="btn-row">
        {result ? (
          <>
            <Button variant="ghost" onClick={() => setOpen(!open)}>
              {open ? 'Nascondi punteggi' : 'Mostra punteggi'}
            </Button>
            <Button variant="danger" onClick={async () => {
              const ok = await dialog.confirm(`Annullare la giornata del ${formatDate(dateKey)}? I punti tornano a zero, i bonus assegnati restano.`, {
                danger: true,
                confirmLabel: 'Annulla giornata',
              })
              if (ok) onRemove()
            }}>
              Annulla giornata
            </Button>
          </>
        ) : (
          <Button variant="primary" size="big" onClick={onCompute}>
            Calcola giornata
          </Button>
        )}
      </div>

      {result && open && (
        <div className="line-details">
          {teams.map((t) => {
            const d = result.details?.[t.id]
            if (!d) return null
            return (
              <div key={t.id}>
                <h3 style={{ margin: '0.6rem 0 0.3rem' }}>{t.name}: {d.total} punti</h3>
                <table className="table">
                  <thead>
                    <tr><th>Giocatore</th><th className="num">Base</th><th>Bonus e malus</th><th className="num">Totale</th></tr>
                  </thead>
                  <tbody>
                    {d.players.map((x) => (
                      <tr key={x.playerId}>
                        <td>{x.name}</td>
                        <td className="num">{x.base}</td>
                        <td>
                          {x.ev.length === 0 ? '—' : x.ev.map((e, i) => (
                            <span key={i} className={`ev ${e.points >= 0 ? 'ev-plus' : 'ev-minus'}`}>
                              {e.label} ({e.points > 0 ? '+' : ''}{e.points})
                            </span>
                          ))}
                        </td>
                        <td className="num"><strong>{x.total}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
