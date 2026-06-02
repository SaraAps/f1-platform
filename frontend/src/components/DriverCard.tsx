import { useState, useEffect } from 'react'
import FlipCard from './FlipCard'
import { Driver } from '../types'
import { TEAM_COLORS } from '../constants/theme'
import { GLASS_EMPTY, glassTinted } from '../constants/glass'

interface DriverCardProps {
  driver: Driver | null
}

export default function DriverCard({ driver }: DriverCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [imgSrc, setImgSrc] = useState<'jpg' | 'png' | 'fallback'>('jpg')

  // Reset when driver changes (fixes flip state persisting across mode switches)
  useEffect(() => {
    setFlipped(false)
    setImgSrc('jpg')
  }, [driver?.abbrev])

  const teamColor = driver ? (TEAM_COLORS[driver.team]?.primary ?? '#333333') : '#333333'

  const handleImgError = () => {
    if (imgSrc === 'jpg') setImgSrc('png')
    else setImgSrc('fallback')
  }

  const front = driver ? (
    imgSrc !== 'fallback' ? (
      <img
        src={`/assets/drivers/${driver.abbrev}.${imgSrc}`}
        alt={driver.name}
        onError={handleImgError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
          borderRadius: 18,
        }}
      />
    ) : (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-2 p-4"
        style={glassTinted(teamColor)}
      >
        <span className="text-5xl font-black">#{driver.number}</span>
        <span className="text-sm font-bold text-center">{driver.name}</span>
        <span className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>{driver.team}</span>
      </div>
    )
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={GLASS_EMPTY}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  const back = driver ? (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-4"
      style={{ ...glassTinted(teamColor), borderRadius: 18 }}
    >
      <div className="text-4xl font-black">#{driver.number}</div>
      <div className="text-sm font-bold mt-2 text-center">{driver.name}</div>
      <div className="text-xs mt-1 text-center" style={{ color: 'rgba(255,255,255,0.6)' }}>{driver.team}</div>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center" style={{ ...GLASS_EMPTY, borderRadius: 18 }}>
      <span className="text-6xl font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1.5">
      <span className="card-label">Driver</span>
      <FlipCard
        frontContent={front}
        backContent={back}
        isFlipped={flipped && driver !== null}
        onClick={() => driver && setFlipped(f => !f)}
      />
    </div>
  )
}
