import React, { useState } from 'react'
import { useApp } from '../state/store'
import { Button, Card, Field, TextInput, DateInput, Stepper, PageTitle, Pill, Empty } from '../ui/parts'
import TeamsEditor from './TeamsEditor'
import { pullState, pushState, syncConfigured } from '../lib/sync'

export default function SetupScreen({ onNavigate, onBack }) {
  const { state, update, resetAll, replaceState } = useApp()
  const net = state.net
  const [netStatus, setNetStatus] = useState(null)
  const cfg = state.config

  const setField = (key) => (e) => update((s) => ({ ...s, config: { ...s.config, [key]: e.target.value } }))
  const setNumber = (key, min, max) => (e) => update((s) => {
    const v = Math.min(max, Math.max(min, Math.round(Number(e.target.value) || min)))
    return { ...s, config: { ...s.config, [key]: v } }
  })

  const datesOk = cfg.startDate && cfg.endDate && cfg.startDate <= cfg.endDate

  return (
    <main>
      <PageTitle title="Impostazioni" subtitle="Tutto si può modificare in seguito" onBack={onBack} />

      <Card title="Lega">
        <div className="form-grid">
          <Field label="Nome della lega">
            <TextInput value={cfg.name} onChange={setField('name')} />
          </Field>
          <Field label="Chi calcola le giornate" help="Una sola persona: ogni giorno preme «Calcola giornata»">
            <TextInput value={cfg.host} onChange={setField('host')} placeholder="Nome e cognome" />
          </Field>
        </div>
      </Card>

      <Card title="Regole">
        <div className="form-grid">
          <Field label="Crediti per squadra">
            <Stepper label="crediti" value={cfg.budget} step={10} min={50} max={2000} onChange={setNumber('budget', 50, 2000)} />
          </Field>
          <Field label="Giocatori schierati a giornata">
            <Stepper label="giocatori" value={cfg.formationSize} step={1} min={1} max={12} onChange={setNumber('formationSize', 1, 12)} />
          </Field>
          <Field label="Punti minimi casuale" help="Punti base di ogni giocatore a ogni giornata">
            <Stepper label="punti minimi" value={cfg.minPoints} step={5} min={0} max={95} onChange={setNumber('minPoints', 0, 95)} />
          </Field>
          <Field label="Punti massimi casuale">
            <Stepper label="punti massimi" value={cfg.maxPoints} step={5} min={5} max={200} onChange={setNumber('maxPoints', 5, 200)} />
          </Field>
        </div>
      </Card>

      <Card title="Calendario natalizio">
        <div className="form-grid">
          <Field label="Prima giornata" help="Giorno reale della prima sfida">
            <DateInput value={cfg.startDate} onChange={setField('startDate')} />
          </Field>
          <Field label="Ultima giornata">
            <DateInput value={cfg.endDate} onChange={setField('endDate')} />
          </Field>
        </div>
        {!datesOk && <p className="warn">La prima giornata deve venire prima dell'ultima.</p>}
        <p className="note">Ogni giorno compreso tra le due date diventa una giornata da calcolare.</p>
      </Card>

      <TeamsEditor />

      <Card title="Bonus e Malus">
        <p className="note">Le regole dei punti extra: le definisci tu, una per volta.</p>
        <div className="btn-row">
          <Button variant="primary" onClick={() => onNavigate('rules')}>Gestisci bonus e malus</Button>
        </div>
      </Card>

      <NetworkCard net={net} netStatus={netStatus} setNetStatus={setNetStatus} />

      <Card title="Copia di sicurezza">
        <div className="btn-row">
          <ExportButton />
          <ImportButton />
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Azzerare tutti i dati della lega? Operazione definitiva.')) resetAll()
            }}
          >
            Azzerare tutto
          </Button>
        </div>
        <p className="note">
          La lega vive anche in questo telefono: la copia serve come riserva o per portarla su un telefono nuovo.
        </p>
      </Card>
    </main>
  )
}

function NetworkCard({ net, netStatus, setNetStatus }) {
  const { update, state } = useApp()

  const setUrl = (value) => update((s) => ({ ...s, net: { ...s.net, url: value, enabled: false } }))
  const setRoom = (value) => update((s) => ({ ...s, net: { ...s.net, room: value.trim(), enabled: false } }))

  const activate = async () => {
    if (!syncConfigured(net)) {
      alert('Scrivi l’indirizzo del database e il nome della stanza.')
      return
    }
    setNetStatus('connessione…')
    try {
      const remote = await pullState(net)
      if (remote && (remote.players?.length || remote.teams?.length)) {
        if (confirm('La stanza esiste già e contiene una lega. La carico su questo telefono? (Annulla per non cambiare niente)')) {
          replaceState(remote)
        }
      } else {
        await pushState(net, { ...state, net: { ...net, enabled: true }, rev: Date.now() })
      }
      update((s) => ({ ...s, net: { ...s.net, enabled: true } }))
      setNetStatus('ok: i telefoni sono collegati')
    } catch (e) {
      setNetStatus(null)
      alert('Connessione non riuscita: controlla l’indirizzo del database. (' + e.message + ')')
    }
  }

  const deactivate = () => {
    update((s) => ({ ...s, net: { ...s.net, enabled: false } }))
    setNetStatus(null)
  }

  return (
    <Card title="Gioco tra i telefoni" actions={net.enabled ? <Pill tone="good">collegati</Pill> : null}>
      {net.enabled ? (
        <>
          <p className="note">
            Tutti i telefoni con lo stesso indirizzo e la stessa stanza vedono la stessa lega,
            aggiornata da sola ogni pochi secondi. Nessun file da spostare.
          </p>
          <div className="btn-row">
            <Button variant="danger" onClick={deactivate}>Scollega questo telefono</Button>
          </div>
        </>
      ) : (
        <>
          <Empty>Per giocare tutti sulla stessa lega: crea il database gratuito (vedi la guida sotto), poi compila qui.</Empty>
          <div className="form-grid">
            <Field label="Indirizzo del database" help="Da Firebase: l’URL che finisce con -rtdb.firebaseio.com">
              <TextInput value={net.url} onChange={setUrl} placeholder="https://fantanatale-xxxxx-default-rtdb.firebaseio.com" />
            </Field>
            <Field label="Nome della stanza" help="Una parola, uguale su tutti i telefoni">
              <TextInput value={net.room} onChange={setRoom} placeholder="famiglia-2025" />
            </Field>
          </div>
          <div className="btn-row">
            <Button variant="primary" onClick={activate}>Collega questo telefono</Button>
          </div>
          <p className="note">
            {netStatus ? `Stato: ${netStatus}. ` : ''}Guida: console.firebase.google.com → nuovo progetto →
            Realtime Database → crea → copia l’URL qui sopra. Nei permessi imposta leggi e scrivi = true durante le feste.
          </p>
        </>
      )}
    </Card>
  )
}

function ExportButton() {
  const { state } = useApp()
  const download = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `fantanatale-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return <Button onClick={download}>Esporta su file</Button>
}

function ImportButton() {
  const { replaceState } = useApp()
  return (
    <>
      <Button onClick={() => document.getElementById('import-input').click()}>Importa da file</Button>
      <input
        id="import-input"
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const data = JSON.parse(reader.result)
              if (!confirm('Importare questa lega? I dati attuali in questo telefono verranno sostituiti.')) return
              replaceState(data)
              alert('Lega importata correttamente.')
            } catch {
              alert('Il file non è valido.')
            }
          }
          reader.readAsText(file)
          e.target.value = ''
        }}
      />
    </>
  )
}
