import React, { useState } from 'react'
import { useApp } from '../state/store'
import { Button, Card, Field, TextInput, DateInput, Stepper, StepperField, PageTitle, Pill, Empty } from '../ui/parts'
import { useDialog } from '../ui/dialog'
import TeamsEditor from './TeamsEditor'
import { pullState, pushState, syncConfigured } from '../lib/sync'

const FIREBASE_URL = /^https:\/\/[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+\/?$/
const FIREBASE_HOST = /(^|\.)firebaseio\.com$|(^|\.)firebasedatabase\.app$/

export default function SetupScreen({ onNavigate, onBack }) {
  const { state, update, resetAll, replaceState, syncStatus } = useApp()
  const dialog = useDialog()
  const net = state.net
  const [netStatus, setNetStatus] = useState(null)
  const cfg = state.config
  const hasResults = Object.keys(state.results).length > 0

  // onChange riceve direttamente il valore (A1)
  const setField = (key) => (value) => update((s) => ({ ...s, config: { ...s.config, [key]: value } }))

  const setDate = (key) => async (value) => {
    if (!value) return
    if (hasResults) {
      const ok = await dialog.confirm(
        'Ci sono giornate già calcolate: cambiando il calendario gli accoppiamenti già giocati possono cambiare. Continuare?',
        { danger: true, confirmLabel: 'Cambia comunque' },
      )
      if (!ok) return
    }
    setField(key)(value)
  }

  const setNumber = (key, min, max) => (value) => update((s) => {
    const v = Math.min(max, Math.max(min, Math.round(Number(value) || min)))
    return { ...s, config: { ...s.config, [key]: v } }
  })

  const setMinPoints = (value) => update((s) => {
    const v = Math.min(s.config.maxPoints, Math.max(0, Math.round(Number(value) || 0)))
    return { ...s, config: { ...s.config, minPoints: v } }
  })
  const setMaxPoints = (value) => update((s) => {
    const v = Math.max(s.config.minPoints, Math.min(200, Math.round(Number(value) || 5)))
    return { ...s, config: { ...s.config, maxPoints: v } }
  })
  const setRosterSize = (value) => update((s) => {
    const v = Math.max(s.config.formationSize, Math.min(30, Math.round(Number(value) || 1)))
    return { ...s, config: { ...s.config, rosterSize: v } }
  })
  const setFormationSize = (value) => update((s) => {
    const v = Math.min(12, Math.max(1, Math.round(Number(value) || 1)))
    const rosterSize = Math.max(v, s.config.rosterSize)
    return { ...s, config: { ...s.config, formationSize: v, rosterSize } }
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
          <StepperField label="Crediti per squadra">
            <Stepper label="crediti" value={cfg.budget} step={10} min={50} max={2000} onChange={setNumber('budget', 50, 2000)} />
          </StepperField>
          <StepperField label="Giocatori in rosa" help="Quanti giocatori può comprare ogni squadra all'asta">
            <Stepper label="rosa" value={cfg.rosterSize ?? cfg.formationSize} step={1} min={cfg.formationSize} max={30} onChange={setRosterSize} />
          </StepperField>
          <StepperField label="Giocatori schierati a giornata" help="Meno della rosa: chi resta in panchina non prende punti">
            <Stepper label="titolari" value={cfg.formationSize} step={1} min={1} max={12} onChange={setFormationSize} />
          </StepperField>
          <StepperField label="Punti minimi casuale" help="Punti base di ogni giocatore a ogni giornata">
            <Stepper label="punti minimi" value={cfg.minPoints} step={5} min={0} max={95} onChange={setMinPoints} />
          </StepperField>
          <StepperField label="Punti massimi casuale">
            <Stepper label="punti massimi" value={cfg.maxPoints} step={5} min={5} max={200} onChange={setMaxPoints} />
          </StepperField>
        </div>
      </Card>

      <Card title="Calendario natalizio">
        <div className="form-grid">
          <Field label="Prima giornata" help="Giorno reale della prima sfida">
            <DateInput value={cfg.startDate} onChange={setDate('startDate')} />
          </Field>
          <Field label="Ultima giornata">
            <DateInput value={cfg.endDate} onChange={setDate('endDate')} />
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

      <NetworkCard net={net} netStatus={netStatus} setNetStatus={setNetStatus} syncStatus={syncStatus} />

      <Card title="Copia di sicurezza">
        <div className="btn-row">
          <ExportButton />
          <ImportButton />
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await dialog.confirm('Azzerare tutti i dati della lega? Operazione definitiva.', {
                danger: true,
                confirmLabel: 'Azzera tutto',
              })
              if (ok) resetAll()
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

function NetworkCard({ net, netStatus, setNetStatus, syncStatus }) {
  const { update, state, replaceState } = useApp()
  const dialog = useDialog()

  const setUrl = (value) => update((s) => ({ ...s, net: { ...s.net, url: value, enabled: false } }))
  const setRoom = (value) => update((s) => ({ ...s, net: { ...s.net, room: value.trim(), enabled: false } }))

  const activate = async (role = 'admin') => {
    const url = net.url.trim()
    if (!url || !net.room.trim()) {
      dialog.alert('Scrivi l’indirizzo del database e il nome della stanza.', { title: 'Mancano i dati' })
      return
    }
    let hostname = ''
    try {
      hostname = new URL(url).hostname
    } catch {
      hostname = ''
    }
    if (!FIREBASE_URL.test(url) || !FIREBASE_HOST.test(hostname)) {
      dialog.alert('L’indirizzo non sembra un database Firebase. Deve iniziare con https:// e finire con firebaseio.com o firebasedatabase.app.', { title: 'Indirizzo non valido' })
      return
    }
    setNetStatus('connessione…')
    try {
      const remote = await pullState(net)
      if (remote && (remote.players?.length || remote.teams?.length)) {
        if (role === 'guest') {
          // L'ospite copia la lega in sola lettura, senza domande e senza sovrascritture
          // sulla stanza: non scriverà mai.
          replaceState(remote)
        } else {
          const ok = await dialog.confirm(
            'La stanza esiste già e contiene una lega. La carico su questo telefono?',
            { confirmLabel: 'Sì, caricala', cancelLabel: 'Non cambiare niente' },
          )
          if (!ok) {
            setNetStatus(null)
            return
          }
          replaceState(remote)
        }
      } else if (role === 'guest') {
        setNetStatus(null)
        dialog.alert('La stanza è ancora vuota: collega prima il telefono dell’organizzatore. Poi riprova.', { title: 'Stanza vuota' })
        return
      } else {
        await pushState(net, { ...state, net: { ...net, enabled: true, role }, rev: Date.now() })
      }
      update((s) => ({ ...s, net: { ...s.net, enabled: true, role } }))
      setNetStatus(role === 'guest' ? 'ok: questo telefono mostra solo nome e classifica' : 'ok: i telefoni sono collegati')
    } catch (e) {
      setNetStatus(null)
      dialog.alert('Connessione non riuscita: controlla l’indirizzo del database. (' + e.message + ')', { title: 'Connessione fallita' })
    }
  }

  const deactivate = () => {
    update((s) => ({ ...s, net: { ...s.net, enabled: false, role: 'admin' } }))
    setNetStatus(null)
  }

  return (
    <Card
      title="Gioco tra i telefoni"
      actions={
        net.enabled ? (
          syncStatus?.error ? <Pill tone="bad">errore di sincronizzazione</Pill> : <Pill tone="good">collegati ({net.role === 'guest' ? 'ospite' : 'admin'})</Pill>
        ) : null
      }
    >
      {net.enabled ? (
        <>
          <p className="note">
            Tutti i telefoni con lo stesso indirizzo e la stessa stanza vedono la stessa lega,
            aggiornata da sola ogni pochi secondi. Nessun file da spostare.
          </p>
          {net.role === 'guest' && <p className="warn">Questo telefono è collegato come ospite: mostra solo il nome della lega e la classifica, non può modificare niente.</p>}
          {syncStatus?.error && <p className="warn">Ultimo aggiornamento non riuscito: {syncStatus.error}. Riprovo da solo tra poco.</p>}
          <div className="btn-row">
            <Button variant="danger" onClick={deactivate}>Scollega questo telefono</Button>
          </div>
        </>
      ) : (
        <>
          <Empty>Per giocare tutti sulla stessa lega: crea il database gratuito (vedi la guida sotto), poi compila qui.</Empty>
          <div className="form-grid">
            <Field label="Indirizzo del database" help="Da Firebase: l'URL che finisce con -rtdb.firebaseio.com">
              <TextInput value={net.url} onChange={setUrl} placeholder="https://fantanatale-default-rtdb.firebaseio.com" />
            </Field>
            <Field label="Nome della stanza" help="Una parola, uguale su tutti i telefoni">
              <TextInput value={net.room} onChange={setRoom} placeholder={`famiglia-${new Date().getFullYear()}`} />
            </Field>
          </div>
          <div className="btn-row">
            <Button variant="primary" onClick={() => activate('admin')}>Collega come organizzatore</Button>
            <Button onClick={() => activate('guest')}>Collega come ospite</Button>
          </div>
          <p className="note">
            Organizzatore: controllo di tutto (asta, formazioni, giornate). Ospite: vede solo
            il nome della lega e la classifica aggiornata, senza poter toccare niente.
          </p>
          <p className="note">
            {netStatus ? `Stato: ${netStatus}. ` : ''}Guida: console.firebase.google.com → nuovo progetto →
            Realtime Database → crea → copia l'URL qui sopra. Nei permessi imposta leggi e scrivi = true durante le feste.
          </p>
        </>
      )}
    </Card>
  )
}

function ExportButton() {
  const { state } = useApp()
  const download = () => {
    // La configurazione di rete non esce dal telefono (A8)
    const { net, ...data } = state
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
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
  const dialog = useDialog()
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
          reader.onload = async () => {
            try {
              const data = JSON.parse(reader.result)
              const ok = await dialog.confirm('Importare questa lega? I dati attuali in questo telefono verranno sostituiti.', {
                confirmLabel: 'Importa',
              })
              if (!ok) return
              replaceState(data)
              dialog.alert('Lega importata correttamente.', { title: 'Fatto', confirmLabel: 'Ok' })
            } catch {
              dialog.alert('Il file non è valido.', { title: 'File non valido' })
            }
          }
          reader.readAsText(file)
          e.target.value = ''
        }}
      />
    </>
  )
}
