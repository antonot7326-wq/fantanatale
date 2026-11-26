import { useEvents } from './RulesScreen'
import { Button, Pill } from '../ui/parts'

export default function EventRow({ event }) {
  const { removeEvent } = useEvents()
  const positive = event.points >= 0
  return (
    <div className="row">
      <strong className="grow">{event.label}</strong>
      <Pill tone={positive ? 'good' : 'bad'}>
        {positive ? '+' : ''}
        {event.points} punti
      </Pill>
      <Button variant="danger" onClick={() => removeEvent(event.id)}>Elimina</Button>
    </div>
  )
}
