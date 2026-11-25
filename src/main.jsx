import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './ui/theme.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* l'app funziona comunque: il service worker serve solo per l'offline */
    })
  })
}
