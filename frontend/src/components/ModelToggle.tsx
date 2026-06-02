import { useState } from 'react'
import { ModelType } from '../types'
import { F1_RED } from '../constants/theme'

interface ModelToggleProps {
  model: ModelType
  onChange: (model: ModelType) => void
}

const TOOLTIP: Record<ModelType, string> = {
  A: 'Uses only starting grid and historical form. MAE 3.3',
  B: 'Uses in-race pace and strategy data. MAE 2.5',
}

export default function ModelToggle({ model, onChange }: ModelToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleToggle = () => {
    const next: ModelType = model === 'A' ? 'B' : 'A'
    onChange(next)
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 2500)
  }

  return (
    <div className="flex flex-col items-center gap-1 relative">
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-medium"
          style={{ color: model === 'A' ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
        >
          Pre-race Forecast
        </span>

        <button
          onClick={handleToggle}
          className="relative flex items-center w-10 h-5 rounded-full transition-colors duration-200"
          style={{ background: model === 'B' ? F1_RED : 'rgba(255,255,255,0.2)' }}
        >
          <span
            className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
            style={{ transform: model === 'B' ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>

        <span
          className="text-xs font-medium"
          style={{ color: model === 'B' ? '#ffffff' : 'rgba(255,255,255,0.35)' }}
        >
          Full Reconstruction
        </span>
      </div>

      {showTooltip && (
        <div
          className="absolute top-7 text-xs px-3 py-1.5 rounded-lg z-10 whitespace-nowrap"
          style={{
            background: 'rgba(30,30,30,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.75)',
          }}
        >
          Model {model}: {TOOLTIP[model]}
        </div>
      )}
    </div>
  )
}
