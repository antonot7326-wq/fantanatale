// Calendario: ogni giorno reale del periodo natalizio è una giornata.
export function dateRange(startDate, endDate) {
  const out = []
  const d = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(end.getTime()) || d > end) return out
  while (d <= end) {
    out.push(toDateKey(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

export const toDateKey = (d) => d.toISOString().slice(0, 10)

export function formatDate(dateKey) {
  if (!dateKey) return ''
  const d = new Date(`${dateKey}T12:00:00`)
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })
}

export function isToday(dateKey) {
  return dateKey === toDateKey(new Date())
}

// Round-robin col metodo del cerchio; con squadre dispari una squadra riposa per turno.
export function roundRobin(teamIds) {
  const arr = teamIds.filter(Boolean)
  if (arr.length < 2) return arr.length === 1 ? [[[arr[0], null]]] : []
  if (arr.length % 2) arr.push(null)
  const n = arr.length
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const pairs = []
    for (let i = 0; i < n / 2; i++) pairs.push([arr[i], arr[n - 1 - i]])
    rounds.push(pairs)
    arr.splice(1, 0, arr.pop())
  }
  return rounds
}

export function scheduleForDate(teamIds, dateKey, index) {
  const rounds = roundRobin(teamIds)
  if (!rounds.length) return []
  const round = rounds[index % rounds.length]
  const mirrored = index >= rounds.length
  return round.map(([a, b]) => (mirrored ? [b, a] : [a, b]))
}
