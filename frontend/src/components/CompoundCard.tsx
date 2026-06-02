import { useState } from 'react'
import FlipCard from './FlipCard'
import { Compound } from '../types'
import { COMPOUND_COLORS } from '../constants/theme'
import { GLASS_EMPTY, glassTinted } from '../constants/glass'

interface CompoundCardProps {
  compound: Compound | null
}

const DESCRIPTORS: Record<Compound, string> = {
  SOFT:         'Fast · Low durability',
  MEDIUM:       'Balanced · Medium durability',
  HARD:         'Slow · High durability',
  INTERMEDIATE: 'Wet conditions',
  WET:          'Extreme wet conditions',
}

export default function CompoundCard({ compound }: CompoundCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [imgError, setImgError] = useState(false)

  const color = compound ? COMPOUND_COLORS[compound].bg : null

  const front = compound ? (
    !imgError ? (
      <img
        src={`/assets/tyres/${compound}.jpg`}
        alt={compound}
        onError={() => setImgError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18 }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center"
           style={glassTinted(color!)}>
        <span className="text-2xl font-black">{compound}</span>
      </div>
    )
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={GLASS_EMPTY}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  const back = compound ? (
    <div className="w-full h-full flex flex-col items-center justify-center p-4"
         style={{ ...glassTinted(color!), borderRadius: 18 }}>
      <span className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.5)' }}>Pirelli</span>
      <span className="text-2xl font-black mt-2">{compound}</span>
      <span className="text-xs mt-2 text-center"
            style={{ color: 'rgba(255,255,255,0.65)' }}>{DESCRIPTORS[compound]}</span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center"
         style={{ ...GLASS_EMPTY, borderRadius: 18 }}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="card-label">Compound</span>
      <FlipCard
        frontContent={front}
        backContent={back}
        isFlipped={flipped && compound !== null}
        onClick={() => compound && setFlipped(f => !f)}
      />
    </div>
  )
}
