import { PredictionResponse } from '../types'
import ShapChart from './ShapChart'

interface PredictionResultProps {
  result: PredictionResponse
}

const CONFIDENCE_STYLE: Record<string, { bg: string; text: string }> = {
  HIGH:   { bg: 'rgba(76,175,80,0.2)',  text: '#4CAF50' },
  MEDIUM: { bg: 'rgba(255,193,7,0.2)',  text: '#FFC107' },
  LOW:    { bg: 'rgba(232,0,45,0.2)',   text: '#e8002d' },
}

export default function PredictionResult({ result }: PredictionResultProps) {
  const conf = CONFIDENCE_STYLE[result.confidence] ?? CONFIDENCE_STYLE.LOW

  return (
    <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col justify-center">
        <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Predicted
        </span>
        <span
          className="text-8xl font-black leading-none mt-1 animate-scale-in"
          style={{ color: '#ffffff' }}
        >
          P{result.predicted_position}
        </span>

        <div className="flex items-center gap-3 mt-3">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: conf.bg, color: conf.text }}
          >
            {result.confidence}
          </span>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {result.model_used}
          </span>
        </div>

        <div className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          MAE {result.model_mae.toFixed(1)} positions &nbsp;·&nbsp; Spearman r {result.model_spearman.toFixed(2)}
        </div>
      </div>

      <div>
        <ShapChart features={result.top_features} />
      </div>
    </div>
  )
}
