import { useState, useEffect, useRef } from 'react'
import { Driver, Circuit, Compound } from '../types'
import { COMPOUND_COLORS } from '../constants/theme'

interface PredictControlsProps {
  drivers: Driver[]
  circuits: Circuit[]
  selectedDriver: string
  selectedCircuit: string
  gridPosition: number | null
  selectedCompound: Compound | null
  onDriverChange: (v: string) => void
  onCircuitChange: (v: string) => void
  onGridChange: (v: number) => void
  onCompoundChange: (v: Compound) => void
  onPredict: () => void
  loading: boolean
}

const COMPOUNDS: Compound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET']
const COMPOUND_LABELS: Record<Compound, string> = {
  SOFT: 'S', MEDIUM: 'M', HARD: 'H', INTERMEDIATE: 'I', WET: 'W',
}

const selectStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: '#fff',
  padding: '10px 16px',
  width: '100%',
  fontSize: 14,
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none' as const,
  WebkitAppearance: 'none' as const,
}

export default function PredictControls({
  drivers,
  circuits,
  selectedDriver,
  selectedCircuit,
  gridPosition,
  selectedCompound,
  onDriverChange,
  onCircuitChange,
  onGridChange,
  onCompoundChange,
  onPredict,
  loading,
}: PredictControlsProps) {
  const [inputVal, setInputVal] = useState(gridPosition !== null ? `P${gridPosition}` : '')
  const inputDriven = useRef(false)

  useEffect(() => {
    if (!inputDriven.current) {
      setInputVal(gridPosition !== null ? `P${gridPosition}` : '')
    }
    inputDriven.current = false
  }, [gridPosition])

  const handleInputChange = (raw: string) => {
    setInputVal(raw)
    const digits = raw.replace(/^[Pp]/, '').trim()
    const n = parseInt(digits, 10)
    if (!isNaN(n) && n >= 1 && n <= 20) {
      inputDriven.current = true
      onGridChange(n)
    }
  }

  const handleInputBlur = () => {
    setInputVal(gridPosition !== null ? `P${gridPosition}` : '')
  }

  const canPredict =
    selectedDriver !== '' &&
    selectedCircuit !== '' &&
    gridPosition !== null &&
    selectedCompound !== null

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="card-label">Driver</label>
          <select className="dark-select" style={selectStyle}
                  value={selectedDriver} onChange={e => onDriverChange(e.target.value)}>
            <option value="">Select driver…</option>
            {drivers.map(d => (
              <option key={d.abbrev} value={d.abbrev}>{d.name} ({d.abbrev})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="card-label">Circuit</label>
          <select className="dark-select" style={selectStyle}
                  value={selectedCircuit} onChange={e => onCircuitChange(e.target.value)}>
            <option value="">Select circuit…</option>
            {circuits.map(c => (
              <option key={c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="card-label">Grid Position</label>
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-lg font-bold text-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => onGridChange(Math.max(1, (gridPosition ?? 2) - 1))}
            >−</button>
            <input
              className="flex-1 text-center py-2 rounded-lg font-bold text-lg"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff',
                outline: 'none',
                minWidth: 0,
              }}
              value={inputVal}
              placeholder="—"
              onChange={e => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              onFocus={e => e.target.select()}
            />
            <button
              className="w-9 h-9 rounded-lg font-bold text-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: 'none', cursor: 'pointer' }}
              onClick={() => onGridChange(Math.min(20, (gridPosition ?? 0) + 1))}
            >+</button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="card-label">Starting Compound</label>
          <div className="flex gap-1.5">
            {COMPOUNDS.map(c => {
              const colors = COMPOUND_COLORS[c]
              const active = selectedCompound === c
              return (
                <button
                  key={c}
                  onClick={() => onCompoundChange(c)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold"
                  style={{
                    background: active ? colors.bg : 'rgba(255,255,255,0.06)',
                    color: active ? colors.text : 'rgba(255,255,255,0.5)',
                    border: active ? `1px solid ${colors.bg}` : '1px solid rgba(255,255,255,0.1)',
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                >{COMPOUND_LABELS[c]}</button>
              )
            })}
          </div>
        </div>
      </div>

      <button
        className="predict-btn"
        onClick={onPredict}
        disabled={!canPredict || loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            PREDICTING...
          </span>
        ) : 'PREDICT'}
      </button>
    </div>
  )
}
