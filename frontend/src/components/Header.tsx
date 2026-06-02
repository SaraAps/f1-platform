import { F1_RED } from '../constants/theme'

interface HeaderProps {
  mae: number
  spearman: number
}

export default function Header({ mae, spearman }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-baseline gap-2">
        <span
          className="text-3xl font-black tracking-tighter leading-none"
          style={{ color: F1_RED, fontStretch: 'condensed' }}
        >
          F1 ERA
        </span>
        <span className="text-3xl font-black tracking-tighter leading-none text-white">
          PREDICTOR
        </span>
      </div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        MAE {mae.toFixed(1)} &nbsp;|&nbsp; Spearman {spearman.toFixed(2)}
      </div>
    </header>
  )
}
