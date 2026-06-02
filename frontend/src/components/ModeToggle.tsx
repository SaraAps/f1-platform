import { AppMode } from '../types'
import { F1_RED } from '../constants/theme'

interface ModeToggleProps {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

const MODES: { key: AppMode; label: string }[] = [
  { key: 'predict',    label: 'Predict' },
  { key: 'historical', label: 'Historical' },
  { key: 'compare',   label: 'Compare' },
]

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-full p-1"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {MODES.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          style={{
            background: mode === key ? F1_RED : 'transparent',
            color: mode === key ? '#ffffff' : 'rgba(255,255,255,0.45)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
