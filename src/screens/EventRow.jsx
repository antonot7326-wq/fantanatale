import React, { useState } from 'react'
import { useEvents } from './RulesScreen'
import { Button, Pill, TextInput, Stepper, StepperField } from '../ui/parts'
import { useDialog } from '../ui/dialog'

export default function EventRow({ event }) {
  const { editEvent, removeEvent } = useEvents()
  const dialog = useDialog()
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(event.label)
  const [points, setPoints] = useState(event.points)
  const positive = event.points >= 0

  if (editing) {
    const save = () => {
      const clean = label.trim()
      if (!clean) {
        dialog.alert('Il nome della regola non può restare vuoto.')
        return
      }
      editEvent(event.id, clean, points)
      setEditing(false)
    }
    return (
      <div className="row" style={{ flexWrap: 'wrap' }}>
        <TextInput value={label} onChange={setLabel} aria-label="Nome della regola" />
        <StepperField label="Punti">
          <Stepper label="punti" value={points} step={1} min={-30} max={30} onChange={(value) => setPoints(Number(value))} />
        </StepperField>
        <Button variant="primary" onClick={save}>Salva</Button>
        <Button variant="ghost" onClick={() => { setLabel(event.label); setPoints(event.points); setEditing(false) }}>Annulla</Button>
      </div>
    )
  }

  return (
    <div className="row">
      <strong className="grow">{event.label}</strong>
      <Pill tone={positive ? 'good' : 'bad'}>
        {positive ? '+' : ''}
        {event.points} punti
      </Pill>
      <Button variant="ghost" onClick={() => setEditing(true)}>Modifica</Button>
      <Button variant="danger" onClick={() => removeEvent(event.id)}>Elimina</Button>
    </div>
  )
}
