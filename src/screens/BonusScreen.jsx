import React, { useState } from 'react'
import { useStore } from '../store'
import { Section, EmptyHint, NumInput, Pill } from '../components'

export default function BonusScreen({ onDone }) {
  const { state, update } = useStore()
  const [label, setLabel] = useState('')
  const [points, setPoints] = useState('')
  const [chance, setChance] = useState('')

  const add = () => {
    const l = label.trim()
    const p = Number(points)
    const c = chance === '' ? null : Number(chance)
    if (!l) return alert('Scrivi il nome dell\'evento (es. gol, autogol, espulsione…).')
    if (Number.isNaN(p)) return alert('I punti devono essere un numero (negativo per un malus).')
    if (c !== null && (Number.isNaN(c) || c < 0 || c > 100)) return alert('La probabilità deve essere tra 0 e 100.')
    update((s) => {
      s.events.push({ id: crypto.randomUUID(), label: l, points: p, chance: c })
      return s
    })
    setLabel('')
    setPoints('')
    setChance('')
  }

  const remove = (id) => update((s) => {
    s.events = s.events.filter((e) => e.id !== id)
    return s
  })

  return (
    <>
      <Section title="Bonus e malus — definisci tu le regole">
        <p className="lead">
          Elenco volutamente <strong>vuoto</strong>: sono i tuoi eventi, li scegli tu. Per ognuno definisci nome,
          punteggio (negativo = malus) e probabilità che scatti a ogni prestazione di ogni giocatore.
        </p>
        <div className="form-row">
          <input className="input grow" value={label} placeholder="Evento (es. 'gol', 'cartellino rosso'…)" onChange={(e) => setLabel(e.target.value)} />
          <NumInput value={points} step={1} placeholder="punti" onChange={setPoints} />
          <NumInput value={chance} step={1} placeholder="prob. %" onChange={setChance} />
          <button className="btn primary" onClick={add}>+ Aggiungi</button>
        </div>
        <div className="hint">Lascia vuota la probabilità per averla sempre attiva (100%).</div>
        {state.events.length === 0 && (
          <EmptyHint icon="⭐">
            Nessun evento definito. Da qui in poi la simulazione usa solo i punti base casuali — ne parliamo quando vuoi;
            intanto il prototipo funziona anche senza.
          </EmptyHint>
        )}
        <div className="rows">
          {state.events.map((ev) => (
            <div className="row" key={ev.id}>
              <strong className="grow">{ev.label}</strong>
              <Pill tone={ev.points >= 0 ? 'good' : 'bad'}>{ev.points > 0 ? `+${ev.points}` : ev.points} punti</Pill>
              <Pill tone="muted">{ev.chance ?? 100}%</Pill>
              <button className="btn danger ghost" onClick={() => remove(ev.id)}>✕</button>
            </div>
          ))}
        </div>
      </Section>
      <button className="btn primary continue" onClick={onDone}>Prossimo passo: asta 🔨</button>
    </>
  )
}
