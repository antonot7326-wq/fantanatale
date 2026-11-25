import React, { useRef } from 'react'
import { useStore, defaultConfig } from '../store'
import { Section, NumInput, EmptyHint, Pill } from '../components'

export default function SetupScreen({ onDone }) {
  const { state, update, resetAll, importState } = useStore()
  const fileRef = useRef(null)
  const cfg = state.config

  const setCfg = (key) => (v) => update((s) => {
    s.config[key] = v
    return s
  })

  const addTeam = () => update((s) => {
    s.teams.push({ id: crypto.randomUUID(), name: `Squadra ${s.teams.length + 1}`, spent: 0 })
    return s
  })

  const renameTeam = (id, name) => update((s) => {
    const t = s.teams.find((x) => x.id === id)
    if (t) t.name = name
    return s
  })

  const removeTeam = (id) => update((s) => {
    s.players.forEach((p) => { if (p.teamId === id) p.teamId = null })
    s.teams = s.teams.filter((t) => t.id !== id)
    return s
  })

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fantanatale-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const onImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data || typeof data !== 'object' || !Array.isArray(data.players) || !Array.isArray(data.teams)) {
          alert('Il file non sembra un salvataggio FantaNatale valido.')
          return
        }
        importState(data)
        alert('Lega importata! 🎄')
      } catch {
        alert('Impossibile leggere il file: JSON non valido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const datesOk = cfg.startDate && cfg.endDate && cfg.startDate <= cfg.endDate

  return (
    <>
      <Section title="Lega natalizia">
        <div className="form-grid">
          <label>
            Nome lega
            <input className="input" value={cfg.name} onChange={(e) => setCfg('name')(e.target.value)} placeholder="Es. FantaFamiglia Natale 2025" />
          </label>
          <label>
            Host della lega (calcola le giornate)
            <input className="input" value={cfg.host} onChange={(e) => setCfg('host')(e.target.value)} placeholder="Es. Zio Gianni" />
          </label>
          <label>
            Budget crediti per squadra
            <NumInput value={cfg.budget} min={1} step={10} onChange={(v) => setCfg('budget')(Number(v) || 0)} />
          </label>
          <label>
            Giocatori in formazione
            <NumInput value={cfg.formationSize} min={1} max={12} onChange={(v) => setCfg('formationSize')(Math.max(1, Number(v) || 1))} />
          </label>
          <label>
            Prima giornata (giorno reale)
            <input type="date" className="input" value={cfg.startDate} onChange={(e) => setCfg('startDate')(e.target.value)} />
          </label>
          <label>
            Ultima giornata (giorno reale)
            <input type="date" className="input" value={cfg.endDate} onChange={(e) => setCfg('endDate')(e.target.value)} />
          </label>
        </div>
        {!datesOk && (
          <p className="warn">⚠️ Controlla le date: la prima giornata deve venire prima (o lo stesso giorno) dell'ultima.</p>
        )}
        <div className="hint">Ogni giorno reale compreso tra le due date è una giornata da calcolare.</div>
      </Section>

      <Section title={`Squadre (${state.teams.length})`} right={<button className="btn" onClick={addTeam}>+ Aggiungi squadra</button>}>
        {state.teams.length === 0 && <EmptyHint icon="👥">Aggiungi le squadre: qui decidi tu quante sono e come si chiamano.</EmptyHint>}
        <div className="rows">
          {state.teams.map((t) => (
            <div className="row" key={t.id}>
              <input className="input" value={t.name} onChange={(e) => renameTeam(t.id, e.target.value)} />
              <button className="btn danger ghost" onClick={() => removeTeam(t.id)}>Rimuovi</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Regole di simulazione (modificabili)">
        <div className="form-grid">
          <label>
            Punti base minimi per giocatore
            <NumInput value={cfg.minPoints} min={0} onChange={(v) => setCfg('minPoints')(Number(v) || 0)} />
          </label>
          <label>
            Punti base massimi per giocatore
            <NumInput value={cfg.maxPoints} min={1} onChange={(v) => setCfg('maxPoints')(Number(v) || 1)} />
          </label>
        </div>
        <div className="hint">
          A ogni giornata ogni familiare schierato riceve punti base casuali tra min e max, a cui si sommano i tuoi eventi
          bonus/malus definiti nella scheda ⭐ (ognuno con la sua probabilità). Nessuna ruolo: solo punti.
        </div>
      </Section>

      <Section title="Salvataggi e azioni">
        <div className="btn-row">
          <button className="btn" onClick={exportJson}>⬇️ Esporta lega (JSON)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>⬆️ Importa lega (JSON)</button>
          <button
            className="btn danger"
            onClick={() => {
              if (confirm('Azzerare TUTTA la lega? Questa azione non si annulla.')) resetAll()
            }}
          >
            🗑️ Azzera lega
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        <div className="hint">
          I dati vivono nel localStorage di questo browser. Per portare la lega su un altro dispositivo: esporta qui, importa lì.
        </div>
      </Section>
    </>
  )
}
