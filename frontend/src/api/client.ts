const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const api = {
  getDrivers: () => fetch(`${BASE}/drivers`).then(r => r.json()),
  getCircuits: () => fetch(`${BASE}/circuits`).then(r => r.json()),
  predict: (body: object) => fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json()),
  getRaces: (season: number) =>
    fetch(`${BASE}/races/${season}`).then(r => r.json()),
  getHistorical: (season: number, round: number) =>
    fetch(`${BASE}/historical/${season}/${round}`).then(r => r.json()),
  compare: (driver: string, slug: string) =>
    fetch(`${BASE}/compare/${driver}/${slug}`).then(r => r.json()),
}
