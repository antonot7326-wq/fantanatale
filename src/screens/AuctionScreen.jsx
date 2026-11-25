import React, { useState } from 'react'
import { useStore, creditsLeft } from '../store'
import { Section, EmptyHint, Pill, NumInput } from '../components'

export default function AuctionScreen({ onDone }) {
  const { state, update } = useStore()
  const { teams, players, config } = state
  const [free, setFree] = useState('')

  const lot = state.auctionLot
  const unassigned = players.filter((p) => !p.teamId)
  const lotPlayer = lot ? players.find((p) => p.id === lot.playerId) : null
  const lotBidder = lot?.bidderId ? teams.find((t) => t.id === lot.bidderId) : null
  const assignedOf = (teamId) => players.filter((p) => p.teamId === teamId).length
  const auctionOver = state.auctionDone || (players.length > 0 && unassigned.length === 0)

  const canBid = (team) =>
    !!lot &&
    creditsLeft(state, team) >= lot.bid + 1 &&
    assignedOf(team.id) < config.formationSize &&
    lot.bidderId !== team.id

  const startLot = (playerId) => update((s) => {
    s.auctionLot = { playerId, bid: 1, bidderId: null }
    return s
  })

  const raise = (teamId, step) => update((s) => {
    const l = s.auctionLot
    if (!l) return s
    l.bid = l.bid + step
    l.bidderId = teamId
    return s
  })

  const offerFree = () => {
    const v = Number(free)
    if (!lot || Number.isNaN(v) || v <= (lot.bid ?? 0)) {
      alert('Inserisci un importo superiore all\'offerta corrente.')
      return
    }
    update((s) => {
      s.auctionLot.bid = v
      return s
    })
    setFree('')
  }

  const sell = (teamId) => update((s) => {
    const l = s.auctionLot
    if (!l) return s
    const team = s.teams.find((t) => t.id === teamId)
    const player = s.players.find((p) => p.id === l.playerId)
    if (!team || !player) return s
    player.teamId = team.id
    player.price = l.bid
    team.spent += l.bid
    s.auctionLot = null
    return s
  })

  const cancelLot = () => update((s) => {
    s.auctionLot = null
    return s
  })

  const closeAuction = () => {
    if (confirm('Chiudere l\'asta? Potrai comunque riassegnare giocatori a mano.')) {
      update((s) => {
        s.auctionDone = true
        return s
      })
      onDone()
    }
  }

  if (teams.length < 2 || players.length === 0) {
    return (
      <EmptyHint icon="🔨">
        Per iniziare l'asta servono almeno <strong>2 squadre</strong> (scheda ⚙️ Setup) e almeno <strong>1 familiare</strong> (scheda 🎅).
      </EmptyHint>
    )
  }

  return (
    <>
      <Section title="Crediti residui">
        <div className="credits">
          {teams.map((t) => (
            <div key={t.id} className={`credit-chip ${lot?.bidderId === t.id ? 'leading' : ''}`}>
              <strong>{t.name}</strong>
              <span>{creditsLeft(state, t)} cr</span>
              <small>{assignedOf(t.id)}/{config.formationSize} in rosa</small>
            </div>
          ))}
        </div>
      </Section>

      {lotPlayer && (
        <Section title={`All'asta: ${lotPlayer.name}`}>
          <div className="lot">
            <div className="lot-bid">
              {lotBidder ? (
                <Pill tone="good">
                  Rilancio di {lotBidder.name}: {lot.bid} cr
                </Pill>
              ) : (
                <Pill tone="muted">Base d'asta: {lot.bid} cr — nessun rilancio ancora</Pill>
              )}
            </div>
            <div className="lot-actions">
              {teams.map((t) => (
                <div key={t.id} className="bidder">
                  <span>{t.name}</span>
                  <div className="bidder-btns">
                    <button className="btn small" disabled={!canBid(t)} onClick={() => raise(t.id, 1)}>+1</button>
                    <button className="btn small" disabled={!canBid(t)} onClick={() => raise(t.id, 10)}>+10</button>
                    <button
                      className="btn small primary"
                      disabled={!canBid(t) && !(creditsLeft(state, t) >= lot.bid && lot.bidderId !== t.id && assignedOf(t.id) < config.formationSize)}
                      onClick={() => sell(t.id)}
                      title={
                        lotBidder
                          ? lotBidder.id === t.id
                            ? 'È già il miglior offerente'
                            : `${lotBidder.name} ha offerto ${lot.bid} cr`
                          : `Vendi alla base (${lot.bid} cr)`
                      }
                    >
                      Acquista
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="btn-row">
              <input className="input grow" type="number" min={0} value={free} placeholder="Offerta libera…" onChange={(e) => setFree(e.target.value)} />
              <button className="btn" onClick={offerFree}>Offri</button>
              <button className="btn ghost danger" onClick={cancelLot}>Annulla lotto</button>
            </div>
          </div>
        </Section>
      )}

      <Section title={`Giocatori liberi (${unassigned.length})`}>
        {unassigned.length === 0 ? (
          <EmptyHint icon="🎉">Tutti i familiari hanno una squadra! Passa alle formazioni.</EmptyHint>
        ) : (
          <div className="rows">
            {unassigned.map((p) => (
              <div className="row" key={p.id}>
                <strong className="grow">{p.name}</strong>
                <button className="btn small" disabled={!!lot} onClick={() => startLot(p.id)}>
                  Metti all'asta
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="btn-row continue">
        <button className="btn primary" onClick={closeAuction}>
          {auctionOver ? 'Chiudi ufficialmente l\'asta ✅' : 'Chiudi asta (giocatori rimasti restano liberi)'}
        </button>
      </div>
    </>
  )
}
