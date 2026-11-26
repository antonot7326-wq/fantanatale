import { useApp, newId } from '../state/store'
import { Button, Card, TextInput, Empty } from '../ui/parts'
import { useDialog } from '../ui/dialog'

// Nome predefinito libero: "Squadra 1", "Squadra 2"… senza duplicati (B7)
export function freeTeamName(teams) {
  const used = new Set(teams.map((t) => t.name.trim().toLowerCase()))
  for (let n = 1; n < 100; n++) {
    const name = `Squadra ${n}`
    if (!used.has(name.toLowerCase())) return name
  }
  return `Squadra ${Date.now()}`
}

export default function TeamsEditor() {
  const { state, update } = useApp()
  const dialog = useDialog()
  const hasResults = Object.keys(state.results).length > 0

  const addTeam = async () => {
    if (hasResults) {
      const ok = await dialog.confirm(
        'Ci sono giornate già calcolate: aggiungendo una squadra gli accoppiamenti cambiano. Continuare?',
        { danger: true, confirmLabel: 'Aggiungi comunque' },
      )
      if (!ok) return
    }
    update((s) => ({ ...s, teams: [...s.teams, { id: newId(), name: freeTeamName(s.teams), spent: 0 }] }))
  }

  const rename = (id, value) => {
    const clean = value.trim()
    if (!clean) {
      dialog.alert('Il nome della squadra non può restare vuoto.')
      return
    }
    if (state.teams.some((t) => t.id !== id && t.name.trim().toLowerCase() === clean.toLowerCase())) {
      dialog.alert('Esiste già una squadra con questo nome.')
      return
    }
    update((s) => ({ ...s, teams: s.teams.map((t) => (t.id === id ? { ...t, name: clean } : t)) }))
  }

  const remove = async (id) => {
    const team = state.teams.find((t) => t.id === id)
    if (!team) return
    const ok = await dialog.confirm(
      `Rimuovere ${team.name}? I suoi giocatori tornano liberi e gli accoppiamenti già calcolati possono cambiare.`,
      { danger: true, confirmLabel: 'Rimuovi' },
    )
    if (!ok) return
    update((s) => ({
      ...s,
      teams: s.teams.filter((t) => t.id !== id),
      players: s.players.map((p) => (p.teamId === id ? { ...p, teamId: null, price: undefined } : p)),
      lineups: Object.fromEntries(Object.entries(s.lineups).map(([day, per]) => [day, Object.fromEntries(Object.entries(per).filter(([tid]) => tid !== id))])),
      auctionLot: s.auctionLot && (s.auctionLot.bidderId === id || s.players.find((p) => p.id === s.auctionLot.playerId)?.teamId === id) ? null : s.auctionLot,
    }))
  }

  return (
    <Card title={`Squadre (${state.teams.length})`} actions={<Button onClick={addTeam}>Aggiungi squadra</Button>}>
      {state.teams.length === 0 && <Empty>Aggiungi almeno due squadre: i nomi li scegli tu.</Empty>}
      <div className="rows">
        {state.teams.map((t) => (
          <div className="row" key={t.id}>
            <TextInput className="grow" value={t.name} onChange={(value) => rename(t.id, value)} aria-label={`Nome squadra`} />
            <Button variant="danger" onClick={() => remove(t.id)}>Rimuovi</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
