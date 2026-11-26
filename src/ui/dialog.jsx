import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './parts'

// Finestre di dialogo in-app al posto di alert/confirm nativi: grandi, chiare,
// con bottoni larghi e fuori dagli aggiornamenti di stato (A11, Fase D).
const DialogCtx = createContext(null)

export function DialogProvider({ children }) {
  const [current, setCurrent] = useState(null)
  const confirmRef = useRef(null)

  const api = useMemo(
    () => ({
      confirm: (message, options = {}) =>
        new Promise((resolve) => setCurrent({ type: 'confirm', message, ...options, resolve })),
      alert: (message, options = {}) =>
        new Promise((resolve) => setCurrent({ type: 'alert', message, ...options, resolve })),
    }),
    [],
  )

  const close = (result) => {
    current?.resolve(result)
    setCurrent(null)
  }

  useEffect(() => {
    if (!current) return
    confirmRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current])

  return (
    <DialogCtx.Provider value={api}>
      {children}
      {current && (
        <div className="dialog-overlay" role="presentation">
          <div
            className="dialog"
            role={current.type === 'alert' ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-label={current.title ?? 'Conferma'}
          >
            {current.title && <h2>{current.title}</h2>}
            <p>{current.message}</p>
            <div className="btn-row">
              {current.type === 'confirm' && (
                <Button variant="ghost" onClick={() => close(false)}>
                  {current.cancelLabel ?? 'Annulla'}
                </Button>
              )}
              <button
                type="button"
                ref={confirmRef}
                className={`btn btn-${current.danger ? 'danger' : 'primary'}`}
                onClick={() => close(true)}
              >
                {current.confirmLabel ?? 'Conferma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogCtx.Provider>
  )
}

export const useDialog = () => useContext(DialogCtx)
