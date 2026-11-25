import { useApp } from '../state/store'
import { Button, Card, TextInput, Empty } from '../ui/parts'
import { newId } from '../state/store'

export default function TeamsEditor() {
  const { state, update } = useApp()

  const addTeam = () => update((s) => ({ ...s, teams: [...s.teams, { id: newId(), name: `Squadra ${s.teams.length + 1}`, spent: 0 }] }))
  const rename = (id, name) => update((s) => ({ ...s, teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)) }))
  const remove = (id) => update((s) => ({
    ...s,
    teams: s.teams.filter((t) => t.id !== id),
    players: s.players.map((p) => (p.teamId === id ? { ...p, teamId: null, price: undefined } : p)),
  }))

  return (
    <Card title={`Squadre (${state.teams.length})`} actions={<Button onClick={addTeam}>Aggiungi squadra</Button>}>
      {state.teams.length === 0 && <Empty>Aggiungi almeno due squadre: i nomi li scegli tu.</Empty>}
      <div className="rows">
        {state.teams.map((t) => (
          <div className="row" key={t.id}>
            <TextInput value={t.name} onChange={(e) => rename(t.id, e.target.value)} />
            <Button variant="danger" onClick={() => remove(t.id)}>Rimuovi</Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
