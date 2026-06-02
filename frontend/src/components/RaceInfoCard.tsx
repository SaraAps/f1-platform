import { useState } from 'react'
import FlipCard from './FlipCard'
import { HistoricalRaceSummary } from '../types'
import { GLASS_EMPTY, GLASS_NEUTRAL } from '../constants/glass'

interface RaceInfoCardProps {
  summary: HistoricalRaceSummary | null
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function RaceInfoCard({ summary }: RaceInfoCardProps) {
  const [flipped, setFlipped] = useState(false)

  const front = summary ? (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
         style={GLASS_NEUTRAL}>
      <span className="text-6xl font-black">{summary.total_race_laps}</span>
      <span className="card-label">Laps</span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={GLASS_EMPTY}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  const back = summary ? (
    <div className="w-full h-full flex flex-col items-center justify-center p-4"
         style={{ ...GLASS_NEUTRAL, borderRadius: 18 }}>
      <span className="card-label mb-2">Race Date</span>
      <span className="text-sm font-bold text-center">{formatDate(summary.date)}</span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center"
         style={{ ...GLASS_EMPTY, borderRadius: 18 }}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="card-label">Race</span>
      <FlipCard
        frontContent={front}
        backContent={back}
        isFlipped={flipped && summary !== null}
        onClick={() => summary && setFlipped(f => !f)}
      />
    </div>
  )
}
