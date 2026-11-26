import React, { useEffect, useState } from 'react'
import { Card, Button } from '../ui/parts'

// Come mettere l'app sulla schermata Home: pulsante diretto su Android
// (quando il browser lo offre), istruzioni passo-passo su iPhone.
export default function InstallCard() {
  const [deferred, setDeferred] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    const onInstalled = () => setInstalled(true)
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <Card title="Metti l'app sul telefono">
      {deferred ? (
        <div className="btn-row">
          <Button variant="primary" onClick={() => { deferred.prompt(); setDeferred(null) }}>
            Installa FantaNatale
          </Button>
        </div>
      ) : isIos ? (
        <p className="note">
          Con iPhone: apri questa pagina con <strong>Safari</strong>, tocca il pulsante
          <strong> Condividi</strong> (il quadratino con la freccia in basso) e poi
          <strong> «Aggiungi alla schermata Home»</strong>. L'app partirà a schermo intero, senza barra del browser.
        </p>
      ) : (
        <p className="note">
          Con Android: tocca il menu del browser (i tre puntini in alto a destra) e poi
          <strong> «Aggiungi alla schermata Home»</strong> oppure <strong>«Installa app»</strong>.
        </p>
      )}
    </Card>
  )
}
