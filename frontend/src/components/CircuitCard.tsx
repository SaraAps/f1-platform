import { useState } from 'react'
import FlipCard from './FlipCard'
import { Circuit } from '../types'
import { GLASS_EMPTY, GLASS_NEUTRAL } from '../constants/glass'

interface CircuitCardProps {
  circuit: Circuit | null
}

export default function CircuitCard({ circuit }: CircuitCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [imgError, setImgError] = useState(false)

  const front = circuit ? (
    !imgError ? (
      <img
        src={`/assets/circuits/${circuit.slug}.png`}
        alt={circuit.name}
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18 }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center p-4" style={GLASS_NEUTRAL}>
        <span className="text-sm font-semibold text-center" style={{ color: 'rgba(255,255,255,0.8)' }}>
          {circuit.name}
        </span>
      </div>
    )
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={GLASS_EMPTY}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  const back = circuit ? (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden' }}>
      <img
        src={`/assets/flags/${circuit.flag}.jpg`}
        alt={circuit.country}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.2 }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: 20, textAlign: 'center',
                    height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{circuit.name}</p>
        <p style={{ fontSize: 13, color: '#999', margin: 0 }}>{circuit.country}</p>
        {circuit.is_street && (
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99,
                         background: 'rgba(232,0,45,0.3)', color: '#ff6b6b' }}>
            Street Circuit
          </span>
        )}
      </div>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={{ ...GLASS_EMPTY, borderRadius: 18 }}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="card-label">Circuit</span>
      <FlipCard
        frontContent={front}
        backContent={back}
        isFlipped={flipped && circuit !== null}
        onClick={() => circuit && setFlipped(f => !f)}
      />
    </div>
  )
}
