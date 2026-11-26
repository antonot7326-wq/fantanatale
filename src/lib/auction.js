// Logica dell'asta come funzioni pure (A3, A4, A5): testabile senza React.
// Regola crediti: una squadra non può spendere più di quanto le resta, e deve
// tenere almeno 1 credito per ogni slot di rosa ancora vuoto.

export function maxBidNow(credits, rosterCount, rosterSize) {
  const free = Math.max(0, rosterSize - rosterCount)
  if (free === 0) return 0
  return Math.max(0, credits - (free - 1))
}

export function canRaise({ currentBid, amount, isLeader, rosterCount, rosterSize, credits }) {
  if (isLeader) return false
  if (rosterCount >= rosterSize) return false
  const allowed = maxBidNow(credits, rosterCount, rosterSize)
  return amount > 0 && currentBid + amount <= allowed
}

// Vendere il lotto a una squadra: explicitTeamId (pulsante della squadra) o bidderId di testa.
export function applySell(state, teamId) {
  const lot = state.auctionLot
  if (!lot) return state
  const team = state.teams.find((t) => t.id === (teamId ?? lot.bidderId))
  const player = state.players.find((p) => p.id === lot.playerId)
  if (!team || !player) return { ...state, auctionLot: null }
  return {
    ...state,
    players: state.players.map((p) => (p.id === player.id ? { ...p, teamId: team.id, price: lot.bid } : p)),
    teams: state.teams.map((t) => (t.id === team.id ? { ...t, spent: t.spent + lot.bid } : t)),
    auctionLot: null,
    purchases: [
      ...(state.purchases ?? []),
      { playerId: player.id, playerName: player.name, teamId: team.id, price: lot.bid },
    ],
  }
}

// Annulla l'ultimo acquisto: il giocatore torna libero e i crediti alla squadra.
export function undoLastPurchase(state) {
  const purchases = state.purchases ?? []
  const last = purchases[purchases.length - 1]
  if (!last) return state
  return {
    ...state,
    purchases: purchases.slice(0, -1),
    players: state.players.map((p) =>
      p.id === last.playerId ? { ...p, teamId: null, price: undefined } : p,
    ),
    teams: state.teams.map((t) =>
      t.id === last.teamId ? { ...t, spent: Math.max(0, t.spent - last.price) } : t,
    ),
  }
}
