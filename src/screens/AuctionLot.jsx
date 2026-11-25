import React from 'react'
import { useApp } from '../state/store'
import { Button, Card, Pill } from '../ui/parts'

export default function AuctionLot({ canBid, onRaise, onOffer, onSell, onCancel }) {
  const { state } = useApp()
  const lot = state.auctionLot
  const player = state.players.find((p) => p.id === lot?.playerId)
  const leader = lot?.bidderId ? state.teams.find((t) => t.id === lot.bidderId) : null
  const [freeAmount, setFreeAmount] = React.useState('')

  if (!lot || !player) return null

  const tryOffer = (team) => {
    const value = Number(freeAmount)
    if (!value || value <= lot.bid) {
      alert(`L'offerta deve superare i ${lot.bid} crediti attuali.`)
      return
    }
    onOffer(team.id, value)
    setFreeAmount('')
  }

  return (
    <Card title={`In vendita ora: ${player.name}`}>
      <p className="lot-current">
        {leader ? (
          <>
            Offerta più alta: <strong>{lot.bid} crediti</strong> — <Pill tone="gold">{leader.name}</Pill>
          </>
        ) : (
          <>
            Base d'asta: <strong>{lot.bid} crediti</strong> — nessuna squadra ha ancora offerto
          </>
        )}
      </p>

      <div className="lot-teams">
        {state.teams.map((team) => {
          const allowed = canBid(team)
          return (
            <div className="lot-team" key={team.id}>
              <span className="name">{team.name}</span>
              <span className="actions">
                <Button disabled={!allowed} onClick={() => onRaise(team.id, 1)}>
                  +1
                </Button>
                <Button disabled={!allowed} onClick={() => onRaise(team.id, 10)}>
                  +10
                </Button>
                <Button
                  variant="primary"
                  disabled={!allowed && lot.bidderId !== team.id}
                  onClick={() => onSell()}
                >
                  Acquista a {lot.bid}
                </Button>
              </span>
            </div>
          )
        })}
      </div>

      <div className="btn-row">
        <input
          className="input"
          type="number"
          min={0}
          style={{ maxWidth: '9rem' }}
          value={freeAmount}
          placeholder="Offerta libera"
          onChange={(e) => setFreeAmount(e.target.value)}
          aria-label="Offerta libera in crediti"
        />
        {state.teams.map((team) => (
          <Button key={team.id} disabled={!canBid(team)} onClick={() => tryOffer(team)}>
            {team.name} offre
          </Button>
        ))}
      </div>

      <div className="btn-row">
        <Button variant="ghost" onClick={onCancel}>Annulla questa vendita</Button>
      </div>
    </Card>
  )
}
