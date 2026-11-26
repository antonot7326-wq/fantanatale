import { useApp } from '../state/store'
import { creditsLeft, playersOfTeam, isAuctionComplete } from '../state/selectors'
import { Button, Card, Empty, PageTitle } from '../ui/parts'
import AuctionLot from './AuctionLot'

export default function AuctionScreen({ onNavigate }) {
  const { state, update } = useApp()
  const { teams, players, config } = state

  const startLot = (playerId) => update((s) => ({ ...s, auctionLot: { playerId, bid: 1, bidderId: null } }))
  const raise = (teamId, amount) => update((s) => ({
    ...s,
    auctionLot: { ...s.auctionLot, bid: s.auctionLot.bid + amount, bidderId: teamId },
  }))
  const offer = (teamId, amount) => update((s) => ({ ...s, auctionLot: { ...s.auctionLot, bid: amount, bidderId: teamId } }))
  const sell = () => update((s) => {
    const lot = s.auctionLot
    const team = s.teams.find((t) => t.id === lot.bidderId)
    const player = s.players.find((p) => p.id === lot.playerId)
    if (!team || !player) return { ...s, auctionLot: null }
    return {
      ...s,
      players: s.players.map((p) => (p.id === player.id ? { ...p, teamId: team.id, price: lot.bid } : p)),
      teams: s.teams.map((t) => (t.id === team.id ? { ...t, spent: t.spent + lot.bid } : t)),
      auctionLot: null,
    }
  })
  const cancelLot = () => update((s) => ({ ...s, auctionLot: null }))
  const closeAuction = () => update((s) => ({ ...s, auctionDone: true, auctionLot: null }))

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
  const complete = isAuctionComplete(state)

  const canBid = (team) => {
    const lot = state.auctionLot
    if (!lot) return false
    if (lot.bidderId === team.id) return false
    if (creditsLeft(state, team) < lot.bid) return false
    if (playersOfTeam(state, team.id).length >= config.formationSize) return false
    return true
  }

  return (
    <main>
      <PageTitle title="Asta" subtitle="Acquistate i giocatori, uno alla volta" />

      <Card title="Crediti e rose">
        <div className="team-credits">
          {teams.map((t) => (
            <div key={t.id} className={`team-card ${state.auctionLot?.bidderId === t.id ? 'lead' : ''}`}>
              <div className="name">{t.name}</div>
              <div className="credits">{creditsLeft(state, t)} crediti</div>
              <div className="count">
                {playersOfTeam(state, t.id).length} giocatori su {config.formationSize}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {state.auctionLot && (
        <AuctionLot
          canBid={canBid}
          onRaise={raise}
          onOffer={offer}
          onSell={sell}
          onCancel={cancelLot}
        />
      )}

      <Card title={`Giocatori ancora liberi (${free.length})`}>
        {free.length === 0 ? (
          <Empty>Tutti i giocatori hanno una squadra.</Empty>
        ) : (
          <div className="rows">
            {free.map((p) => (
              <div className="row" key={p.id}>
                <strong className="grow">{p.name}</strong>
                <Button variant="primary" disabled={Boolean(state.auctionLot)} onClick={() => startLot(p.id)}>
                  Metti all'asta
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="btn-row">
        <Button variant="primary" onClick={closeAuction}>
          {complete ? 'Passa alle formazioni' : 'Termina l\u2019asta e vai alle formazioni'}
        </Button>
      </div>
    </main>
  )
}
