// Sincronizzazione tra telefoni tramite Firebase Realtime Database (REST, zero dipendenze).
// L'host crea una volta sola il database gratuito e incolla l'indirizzo nell'app;
// da lì ogni telefono legge e scrive la stessa stanza, senza file da spostare.

export function syncEndpoint(net) {
  const base = (net?.url ?? '').trim().replace(/\/+$/, '')
  const room = (net?.room ?? '').trim()
  if (!base || !room) return null
  return `${base}/${encodeURIComponent(room)}.json`
}

export function syncConfigured(net) {
  return Boolean(syncEndpoint(net))
}

export async function pullState(net) {
  const endpoint = syncEndpoint(net)
  if (!endpoint) return null
  const response = await fetch(endpoint, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Risposta ${response.status} dal database`)
  const data = await response.json()
  return data ?? null
}

export async function pushState(net, state) {
  const endpoint = syncEndpoint(net)
  if (!endpoint) return
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!response.ok) throw new Error(`Risposta ${response.status} dal database`)
}
