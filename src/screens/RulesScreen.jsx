import React from 'react'
import { useApp, newId } from '../state/store'
import { Button, Card, TextInput, Empty, PageTitle, Stepper, StepperField } from '../ui/parts'
import { useDialog } from '../ui/dialog'
import EventRow from './EventRow'

export function useEvents() {
  const { state, update } = useApp()
  return {
    events: state.events,
    addEvent: (label, points) => update((s) => ({
      ...s,
      events: [...s.events, { id: newId(), label, points }],
    })),
    editEvent: (id, label, points) => update((s) => ({
      ...s,
      events: s.events.map((e) => (e.id === id ? { ...e, label, points } : e)),
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
        subtitle="Le regole che potrai assegnare a chi vuoi, a ogni giornata"
        onBack={onBack}
      />

      <NewEventCard />

      <Card title={`Regole inserite (${events.length})`}>
        {events.length === 0 ? (
          <Empty>
            Nessuna regola per ora. Crea quelle che userai durante le feste, come «Gol della cena».
          </Empty>
        ) : (
          <div className="rows">
            {events.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </div>
        )}
        <p className="note">
          I punti (negativi per i malus) si sommano a quelli base del giocatore.
          A ogni giornata tocchi la regola sul giocatore che la merita: niente di casuale.
        </p>
      </Card>
    </main>
  )
}

function NewEventCard() {
  const { addEvent } = useEvents()
  const dialog = useDialog()
  const [label, setLabel] = React.useState('')
  const [points, setPoints] = React.useState(5)

  const submit = () => {
    const clean = label.trim()
    if (!clean) {
      dialog.alert('Scrivi il nome della regola (esempio: Gol della cena).')
      return
    }
    addEvent(clean, points)
    setLabel('')
    setPoints(5)
  }

  return (
    <Card title="Nuova regola">
      <div className="form-grid">
        <div className="field">
          <span className="field-label">Nome della regola</span>
          <TextInput value={label} onChange={setLabel} placeholder="Esempio: gol della cena" />
        </div>
        <StepperField label="Punti (negativi = malus)">
          <Stepper label="punti" value={points} step={1} min={-30} max={30} onChange={(value) => setPoints(Number(value))} />
        </StepperField>
      </div>
      <div className="btn-row">
        <Button variant="primary" onClick={submit}>Aggiungi regola</Button>
      </div>
    </Card>
  )
}
