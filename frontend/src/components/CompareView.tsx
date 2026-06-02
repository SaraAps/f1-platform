import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { api } from '../api/client'
import { Driver, Circuit, CompareResult } from '../types'

interface CompareViewProps {
  drivers: Driver[]
  circuits: Circuit[]
  selectedDriver: string
  selectedCircuit: string
  onDriverChange: (v: string) => void
  onCircuitChange: (v: string) => void
}

interface CompareData {
  driver: string
  circuit_slug: string
  results: CompareResult[]
}

function barColor(pos: number | null): string {
  if (pos === null) return '#e8002d'
  if (pos <= 3)  return '#FFD700'
  if (pos <= 6)  return '#4CAF50'
  if (pos <= 10) return '#2196F3'
  return '#666666'
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

export default function CompareView({
  drivers,
  circuits,
  selectedDriver,
  selectedCircuit,
  onDriverChange,
  onCircuitChange,
}: CompareViewProps) {
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDriver || !selectedCircuit) return
    setLoading(true)
    api.compare(selectedDriver, selectedCircuit)
      .then(setData)
      .finally(() => setLoading(false))
  }, [selectedDriver, selectedCircuit])

  const chartData = data?.results.map(r => ({
    season: r.season,
    value: r.dnf ? 0 : (21 - (r.position ?? 21)),
    pos: r.position,
    dnf: r.dnf,
  })) ?? []

  const validPositions = data?.results.filter(r => !r.dnf && r.position !== null).map(r => r.position as number) ?? []
  const best = validPositions.length ? Math.min(...validPositions) : null
  const avg = validPositions.length ? (validPositions.reduce((a, b) => a + b, 0) / validPositions.length).toFixed(1) : '—'
  const dnfs = data?.results.filter(r => r.dnf).length ?? 0

  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Driver</label>
          <select className="dark-select" style={selectStyle} value={selectedDriver} onChange={e => onDriverChange(e.target.value)}>
            <option value="">Select driver…</option>
            {drivers.map(d => <option key={d.abbrev} value={d.abbrev}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Circuit</label>
          <select className="dark-select" style={selectStyle} value={selectedCircuit} onChange={e => onCircuitChange(e.target.value)}>
            <option value="">Select circuit…</option>
            {circuits.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
      )}

      {data && !loading && (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 20]}
                hide
              />
              <YAxis
                type="category"
                dataKey="season"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: 'rgba(20,20,20,0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 12,
                }}
                formatter={(_v: number, _n: string, props: { payload?: { pos: number | null; dnf: boolean } }) => [
                  props.payload?.dnf ? 'DNF' : `P${props.payload?.pos}`,
                  'Result',
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColor(entry.dnf ? null : entry.pos)} />
                ))}
                <LabelList
                  dataKey="pos"
                  position="right"
                  formatter={(v: number | null) =>
                    v ? `P${v}` : ''
                  }
                  style={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Best: <strong className="text-white">{best ? `P${best}` : '—'}</strong>
            &nbsp;·&nbsp; Avg: <strong className="text-white">P{avg}</strong>
            &nbsp;·&nbsp; DNFs: <strong className="text-white">{dnfs}</strong>
          </div>
        </>
      )}
    </div>
  )
}
