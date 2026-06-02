import { useState } from 'react'
import FlipCard from './FlipCard'
import { TEAM_COLORS } from '../constants/theme'
import { GLASS_EMPTY, GLASS_NEUTRAL, glassTinted } from '../constants/glass'

interface GridCardProps {
  position: number | null
  team?: string
}

function getLitCount(pos: number): number {
  if (pos <= 4)  return 1
  if (pos <= 8)  return 2
  if (pos <= 12) return 3
  if (pos <= 16) return 4
  return 5
}

export default function GridCard({ position, team }: GridCardProps) {
  const [flipped, setFlipped] = useState(false)
  const teamColor = team ? (TEAM_COLORS[team]?.primary ?? '#333333') : '#333333'
  const litCount = position ? getLitCount(position) : 0

  const front = position ? (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
         style={GLASS_NEUTRAL}>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rounded-full" style={{
            width: 28, height: 28,
            background: i <= litCount ? '#e8002d' : 'rgba(255,255,255,0.1)',
            boxShadow: i <= litCount ? '0 0 12px #e8002d99' : 'none',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
      <span className="text-4xl font-black">P{position}</span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={GLASS_EMPTY}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  const back = position ? (
    <div className="w-full h-full flex flex-col items-center justify-center p-4"
         style={{ ...glassTinted(teamColor), borderRadius: 18 }}>
      <span className="text-6xl font-black">P{position}</span>
      <span className="text-xs mt-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Starting Position
      </span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={{ ...GLASS_EMPTY, borderRadius: 18 }}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="card-label">Grid Position</span>
      <FlipCard
        frontContent={front}
        backContent={back}
        isFlipped={flipped && position !== null}
        onClick={() => position && setFlipped(f => !f)}
      />
    </div>
  )
}
