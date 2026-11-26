import { useApp } from '../state/store'
import { creditsLeft, playersOfTeam, rosterSize, isAuctionComplete } from '../state/selectors'
import { maxBidNow, canRaise, applySell, undoLastPurchase } from '../lib/auction'
import { Button, Card, Empty, PageTitle, Pill } from '../ui/parts'
import { useDialog } from '../ui/dialog'
import AuctionLot from './AuctionLot'

export default function AuctionScreen({ onNavigate }) {
  const { state, update } = useApp()
  const dialog = useDialog()
  const { teams, players, config } = state

  const startLot = (playerId) => update((s) => (s.auctionLot ? s : { ...s, auctionLot: { playerId, bid: 1, bidderId: null } }))

  const raise = (teamId, amount) => update((s) => {
    const lot = s.auctionLot
    if (!lot || lot.bidderId === teamId) return s
    const team = s.teams.find((t) => t.id === teamId)
    const count = playersOfTeam(s, teamId).length
    if (!canRaise({ currentBid: lot.bid, amount, isLeader: lot.bidderId === teamId, rosterCount: count, rosterSize: rosterSize(s), credits: creditsLeft(s, team) })) return s
    return { ...s, auctionLot: { ...lot, bid: lot.bid + amount, bidderId: teamId } }
  })

  const offer = (teamId, amount) => update((s) => {
    const lot = s.auctionLot
    if (!lot || lot.bidderId === teamId) return s
    const team = s.teams.find((t) => t.id === teamId)
    const count = playersOfTeam(s, teamId).length
    if (!canRaise({ currentBid: lot.bid, amount: amount - lot.bid, isLeader: false, rosterCount: count, rosterSize: rosterSize(s), credits: creditsLeft(s, team) })) return s
    return { ...s, auctionLot: { ...lot, bid: amount, bidderId: teamId } }
  })

  const sell = (teamId) => update((s) => applySell(s, teamId))
  const cancelLot = () => update((s) => ({ ...s, auctionLot: null }))
  const undoLast = () => update((s) => undoLastPurchase(s))
  const reopen = () => update((s) => ({ ...s, auctionDone: false }))

  const closeAuction = async () => {
    const ok = await dialog.confirm('Terminare l\u2019asta? Potrai riaprirla da qui o dalla Home.', { confirmLabel: 'Termina' })
    if (!ok) return
    update((s) => ({ ...s, auctionDone: true, auctionLot: null }))
    onNavigate('lineups')
  }

  if (teams.length < 2 || players.length === 0) {
    return (
      <main>
        <PageTitle title="Asta" />
        <Card>
          <Empty>Prima servono le squadre (in Impostazioni) e i giocatori.</Empty>
        </Card>
      </main>
    )
  }

  const free = players.filter((p) => !p.teamId)
  const size = rosterSize(state)
  const complete = isAuctionComplete(state)
  const lot = state.auctionLot
  const lotPlayer = lot ? players.find((p) => p.id === lot.playerId) : null
  const lastPurchase = (state.purchases ?? [])[state.purchases?.length - 1] ?? null

  // A5: offerta massima = crediti meno una riserva di 1 credito per ogni slot ancora vuoto
  const maxOfferFor = (team) => maxBidNow(creditsLeft(state, team), playersOfTeam(state, team.id).length, size)

  const canBid = (team, amount) => {
    if (!lot) return false
    return canRaise({
      currentBid: lot.bid,
      amount,
      isLeader: lot.bidderId === team.id,
      rosterCount: playersOfTeam(state, team.id).length,
      rosterSize: size,
      credits: creditsLeft(state, team),
    })
  }

  return (
    <main>
      <PageTitle title="Asta" subtitle={`Ogni squadra compra fino a ${size} giocatori`} />

      {state.auctionDone && (
        <Card>
          <p className="note">L'asta è terminata: le squadre sono complete o hai chiuso prima.</p>
          <div className="btn-row">
            <Button onClick={reopen}>Riapri l'asta</Button>
            <Button variant="primary" onClick={() => onNavigate('lineups')}>Vai alle formazioni</Button>
          </div>
        </Card>
      )}

      <Card title="Crediti e rose">
        <div className="team-credits">
          {teams.map((t) => (
            <div key={t.id} className={`team-card ${lot?.bidderId === t.id ? 'lead' : ''}`}>
              <div className="name">{t.name}</div>
              <div className="credits">{creditsLeft(state, t)} crediti</div>
              <div className="count">
                {playersOfTeam(state, t.id).length} giocatori su {size}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {lot && !lotPlayer && (
        <Card title="Asta bloccata">
          <Empty>La vendita in corso non è più valida (il giocatore non esiste più).</Empty>
          <div className="btn-row">
            <Button variant="primary" onClick={cancelLot}>Sblocca l'asta</Button>
          </div>
        </Card>
      )}

      {lot && lotPlayer && (
        <AuctionLot
          canBid={canBid}
          maxOfferFor={maxOfferFor}
          onRaise={raise}
          onOffer={offer}
          onSell={sell}
          onCancel={cancelLot}
        />
      )}

      {lastPurchase && !lot && (
        <Card title="Ultimi acquisti">
          <div className="rows">
            {(state.purchases ?? []).slice(-3).reverse().map((p, i) => (
              <div className="row" key={i}>
                <strong className="grow">{p.playerName}</strong>
                <span>{teams.find((t) => t.id === p.teamId)?.name ?? '—'}</span>
                <Pill tone="good">{p.price} cr</Pill>
              </div>
            ))}
          </div>
          <div className="btn-row">
            <Button variant="ghost" onClick={undoLast}>
              Annulla l'ultimo acquisto ({lastPurchase.playerName})
            </Button>
          </div>
        </Card>
      )}

      <Card title={`Giocatori ancora liberi (${free.length})`}>
        {free.length === 0 ? (
          <Empty>Tutti i giocatori hanno una squadra.</Empty>
        ) : (
          <div className="rows">
            {free.map((p) => (
              <div className="row" key={p.id}>
                <strong className="grow">
                  {p.name}
                  {(p.strength ?? 5) !== 5 && <span className="team-meta"> · forza {p.strength}</span>}
                </strong>
                <Button variant="primary" disabled={Boolean(lot)} onClick={() => startLot(p.id)}>
                  Metti all'asta
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="btn-row">
        <Button variant="primary" onClick={closeAuction}>
          Termina l’asta e vai alle formazioni
        </Button>
      </div>
    </main>
  )
}
