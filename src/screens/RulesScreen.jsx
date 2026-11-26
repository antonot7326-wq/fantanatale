import React from 'react'
import { useApp, newId } from '../state/store'
import { Button, Card, TextInput, Empty, PageTitle, Stepper } from '../ui/parts'
import EventRow from './EventRow'

export function useEvents() {
  const { state, update } = useApp()
  return {
    events: state.events,
    addEvent: (label, points, chance) => update((s) => ({
      ...s,
      events: [...s.events, { id: newId(), label, points, chance }],
    })),
    removeEvent: (id) => update((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) })),
  }
}

export default function RulesScreen({ onBack }) {
  const { events } = useEvents()

  return (
    <main>
      <PageTitle
        title="Bonus e Malus"
        subtitle="Regole dei punti extra: ognuna la definisci tu"
        onBack={onBack}
      />

      <p className="note">La simulazione funziona anche senza regole: aggiungerle è facoltativo.</p>

      <NewEventCard />

      <Card title={`Regole inserite (${events.length})`}>
        {events.length === 0 ? (
          <Empty>
            Nessuna regola per ora. La simulazione funziona anche senza: aggiungerle è facoltativo.
          </Empty>
        ) : (
          <div className="rows">
            {events.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </div>
        )}
        <p className="note">
          A ogni giornata, ogni regola può scattare su un giocatore con la probabilità indicata:
          i punti (numeri negativi per i malus) si sommano ai punti base.
        </p>
      </Card>
    </main>
  )
}

function NewEventCard() {
  const { addEvent } = useEvents()
  const [label, setLabel] = React.useState('')
  const [points, setPoints] = React.useState(5)
  const [chance, setChance] = React.useState(20)

  const submit = () => {
    const clean = label.trim()
    if (!clean) {
      alert('Scrivi il nome della regola (esempio: Gol della cena).')
      return
    }
    addEvent(clean, points, chance)
    setLabel('')
    setPoints(5)
    setChance(20)
  }

  return (
    <Card title="Nuova regola">
      <div className="form-grid">
        <div className="field">
          <span className="field-label">Nome della regola</span>
          <TextInput value={label} onChange={setLabel} placeholder="Esempio: gol della cena" />
        </div>
        <div className="field">
          <span className="field-label">Punti (negativi = malus)</span>
          <Stepper label="punti" value={points} step={1} min={-30} max={30} onChange={(e) => setPoints(Number(e.target.value))} />
        </div>
        <div className="field">
          <span className="field-label">Probabilità</span>
          <Stepper label="probabilità" value={chance} step={5} min={0} max={100} onChange={(e) => setChance(Number(e.target.value))} />
          <span className="field-help">Possibilità su 100 che scatti, per giocatore, a ogni giornata</span>
        </div>
      </div>
      <div className="btn-row">
        <Button variant="primary" onClick={submit}>Aggiungi regola</Button>
      </div>
    </Card>
  )
}
