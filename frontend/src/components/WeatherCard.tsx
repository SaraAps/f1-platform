import { useState } from 'react'
import FlipCard from './FlipCard'
import { GLASS_EMPTY, glassTinted } from '../constants/glass'

interface WeatherCardProps {
  isWet: boolean | null
}

const WET_COLOR = '#0067ff'
const DRY_COLOR = '#F5A623'

export default function WeatherCard({ isWet }: WeatherCardProps) {
  const [flipped, setFlipped] = useState(false)
  const color = isWet !== null ? (isWet ? WET_COLOR : DRY_COLOR) : null

  const front = isWet !== null ? (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3"
         style={glassTinted(color!)}>
      <div className="flex gap-1.5">
        {isWet
          ? [1, 2, 3].map(i => (
              <div key={i} className="rounded-full"
                   style={{ width: 9, height: 9, background: 'rgba(100,180,255,0.85)' }} />
            ))
          : [1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-full"
                   style={{ width: 7, height: 7, background: 'rgba(255,210,100,0.9)' }} />
            ))
        }
      </div>
      <span className="text-3xl font-black tracking-widest">{isWet ? 'WET' : 'DRY'}</span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={GLASS_EMPTY}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  const back = isWet !== null ? (
    <div className="w-full h-full flex flex-col items-center justify-center p-4"
         style={{ ...glassTinted(color!), borderRadius: 18 }}>
      <span className="text-xl font-black">{isWet ? 'Wet Race' : 'Dry Race'}</span>
      <span className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.65)' }}>
        {isWet ? 'Rain during race' : 'No rain during race'}
      </span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center"
         style={{ ...GLASS_EMPTY, borderRadius: 18 }}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="card-label">Weather</span>
      <FlipCard
        frontContent={front}
        backContent={back}
        isFlipped={flipped && isWet !== null}
        onClick={() => isWet !== null && setFlipped(f => !f)}
      />
    </div>
  )
}
