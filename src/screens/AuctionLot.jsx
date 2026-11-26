import React, { useState } from 'react'
import { useApp } from '../state/store'
import { creditsLeft, playersOfTeam, rosterSize } from '../state/selectors'
import { Button, Card, Pill } from '../ui/parts'
import { useDialog } from '../ui/dialog'

export default function AuctionLot({ canBid, maxOfferFor, onRaise, onOffer, onSell, onCancel }) {
  const { state } = useApp()
  const dialog = useDialog()
  const lot = state.auctionLot
  const player = state.players.find((p) => p.id === lot?.playerId)
  const leader = lot?.bidderId ? state.teams.find((t) => t.id === lot.bidderId) : null
  const [freeAmount, setFreeAmount] = useState('')
  const size = rosterSize(state)

  if (!lot || !player) return null

  const tryOffer = (team) => {
    const value = Math.round(Number(freeAmount))
    const maxOffer = maxOfferFor(team)
    if (!Number.isInteger(value) || value < 1) {
      dialog.alert('Scrivi un numero intero di crediti.', { title: 'Offerta non valida' })
      return
    }
    if (value < lot.bid || (leader && value <= lot.bid)) {
      dialog.alert(`L'offerta deve superare i ${lot.bid} crediti attuali.`, { title: 'Offerta troppo bassa' })
      return
    }
    if (value > maxOffer) {
      dialog.alert(
        `${team.name} può arrivare al massimo a ${maxOffer} crediti: deve tenere almeno 1 credito per ogni posto ancora vuoto.`,
        { title: 'Crediti non bastano' },
      )
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
          return (
            <div className="lot-team" key={team.id}>
              <span className="name">{team.name}</span>
              <span className="team-meta">
                {creditsLeft(state, team)} cr · {playersOfTeam(state, team.id).length}/{size}
              </span>
              <span className="actions">
                <Button disabled={!canBid(team, 1)} onClick={() => onRaise(team.id, 1)} aria-label={`${team.name}: offri 1 credito di più`}>
                  +1
                </Button>
                <Button disabled={!canBid(team, 5)} onClick={() => onRaise(team.id, 5)} aria-label={`${team.name}: offri 5 crediti di più`}>
                  +5
                </Button>
                <Button disabled={!canBid(team, 10)} onClick={() => onRaise(team.id, 10)} aria-label={`${team.name}: offri 10 crediti di più`}>
                  +10
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
          inputMode="numeric"
          step={1}
          min={1}
          style={{ maxWidth: '9rem' }}
          value={freeAmount}
          placeholder="Offerta libera"
          onChange={(e) => setFreeAmount(e.target.value)}
          aria-label="Offerta libera in crediti"
        />
        {state.teams.map((team) => (
          <Button key={team.id} disabled={!canBid(team, 1) || !freeAmount} onClick={() => tryOffer(team)}>
            {team.name} offre
          </Button>
        ))}
      </div>

      <div className="btn-row">
        {leader ? (
          <Button variant="primary" size="big" onClick={() => onSell(leader.id)}>
            Assegna a {leader.name} per {lot.bid} crediti
          </Button>
        ) : (
          state.teams.map((team) => (
            <Button
              key={team.id}
              variant="primary"
              disabled={playersOfTeam(state, team.id).length >= size || maxOfferFor(team) < lot.bid}
              onClick={() => onSell(team.id)}
            >
              Assegna a {team.name} alla base
            </Button>
          ))
        )}
      </div>

      <div className="btn-row">
        <Button variant="ghost" onClick={onCancel}>Annulla questa vendita</Button>
      </div>
    </Card>
  )
}
