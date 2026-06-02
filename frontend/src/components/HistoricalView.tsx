import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import { HistoricalRace, HistoricalRaceSummary, SeasonRace } from '../types'

interface HistoricalViewProps {
  onRaceData: (summary: HistoricalRaceSummary | null) => void
}

const selectStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  color: '#fff',
  padding: '10px 14px',
  fontSize: 14,
  outline: 'none',
  cursor: 'pointer',
}

function predictionColor(predicted: number, actual: number): string {
  const diff = Math.abs(predicted - actual)
  if (diff <= 3) return '#4CAF50'
  if (diff <= 5) return '#FFC107'
  return '#e8002d'
}

export default function HistoricalView({ onRaceData }: HistoricalViewProps) {
  const [season, setSeason] = useState<number | ''>('')
  const [seasonRaces, setSeasonRaces] = useState<SeasonRace[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [data, setData] = useState<HistoricalRace | null>(null)
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<Record<string, number>>({})

  // When season changes: fetch race list, clear event selection
  useEffect(() => {
    setSelectedEvent('')
    setData(null)
    setPredictions({})
    onRaceData(null)
    if (season === '') { setSeasonRaces([]); return }
    api.getRaces(season as number).then(setSeasonRaces)
  }, [season])  // eslint-disable-line react-hooks/exhaustive-deps

  // When event selected: find round, fetch data
  useEffect(() => {
    if (!selectedEvent || !seasonRaces.length) return
    const race = seasonRaces.find(r => r.event_name === selectedEvent)
    if (!race) return
    setLoading(true)
    setData(null)
    setPredictions({})
    onRaceData(null)
    api.getHistorical(season as number, race.round)
      .then((d: HistoricalRace) => {
        setData(d)
        const winner = d.results.find(r => r.position === 1)
        if (winner) {
          onRaceData({
            winner_abbrev:   winner.driver,
            event_name:      d.event_name,
            is_wet:          d.is_wet,
            total_race_laps: d.total_race_laps,
            driver_count:    d.driver_count,
            date:            d.date,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [selectedEvent])  // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch predictions for each driver after data loads
  useEffect(() => {
    if (!data) { setPredictions({}); return }
    Promise.all(
      data.results.map(r =>
        api.predict({
          driver:        r.driver,
          circuit:       data.event_name,
          grid_position: r.grid,
          compound:      'SOFT',
          season:        data.season,
          model:         'B',
        }).then((pred: { predicted_position: number }) => ({
          driver:    r.driver,
          predicted: pred.predicted_position,
        }))
      )
    ).then(results => {
      const map: Record<string, number> = {}
      results.forEach(({ driver, predicted }) => { map[driver] = predicted })
      setPredictions(map)
    })
  }, [data])

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest"
                 style={{ color: 'rgba(255,255,255,0.4)' }}>Season</label>
          <select className="dark-select" style={selectStyle}
                  value={season}
                  onChange={e => setSeason(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">—</option>
            {[2022, 2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs uppercase tracking-widest"
                 style={{ color: 'rgba(255,255,255,0.4)' }}>Circuit</label>
          <select className="dark-select" style={{ ...selectStyle, width: '100%' }}
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  disabled={!seasonRaces.length}>
            <option value="">{seasonRaces.length ? 'Select circuit…' : '—'}</option>
            {seasonRaces.map(r => (
              <option key={r.round} value={r.event_name}>{r.event_name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
      )}

      {!data && !loading && (
        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {!season
            ? 'Select a season and circuit to explore a race'
            : !selectedEvent
              ? 'Select a circuit to explore a race'
              : 'No data available'}
        </div>
      )}

      {data && !loading && (
        <div>
          <h3 className="text-sm font-bold mb-3">
            {data.event_name} — {data.season}
          </h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="text-left py-2 pr-4">Pos</th>
                  <th className="text-left py-2 pr-4">Predicted</th>
                  <th className="text-left py-2 pr-4">Driver</th>
                  <th className="text-left py-2 pr-4">Team</th>
                  <th className="text-left py-2 pr-4">Grid</th>
                  <th className="text-left py-2 pr-4">Pts</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map(r => {
                  const pred = predictions[r.driver]
                  const isDnf = r.status !== 'Finished'
                  return (
                    <tr
                      key={r.driver}
                      style={{
                        background: isDnf ? 'rgba(232,0,45,0.08)' : 'transparent',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <td className="py-2 pr-4 font-bold">{r.position ?? '—'}</td>
                      <td className="py-2 pr-4 font-semibold">
                        {pred !== undefined && r.position !== null ? (
                          <span style={{ color: predictionColor(pred, r.position) }}>
                            P{pred}
                          </span>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.2)' }}>…</span>
                        )}
                      </td>
                      <td className="py-2 pr-4">{r.driver}</td>
                      <td className="py-2 pr-4" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.team}</td>
                      <td className="py-2 pr-4">{r.grid}</td>
                      <td className="py-2 pr-4">{r.points}</td>
                      <td className="py-2" style={{ color: isDnf ? '#e8002d' : 'rgba(255,255,255,0.6)' }}>
                        {r.status}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
