import React from 'react'

interface FlipCardProps {
  frontContent: React.ReactNode
  backContent: React.ReactNode
  isFlipped: boolean
  onClick: () => void
}

export default function FlipCard({ frontContent, backContent, isFlipped, onClick }: FlipCardProps) {
  return (
    <div
      className="flip-card-container cursor-pointer"
      style={{ width: 200, height: 280 }}
      onClick={onClick}
    >
      <div className={`flip-card-inner${isFlipped ? ' flipped' : ''}`}>
        <div className="flip-card-front glass-card">{frontContent}</div>
        <div className="flip-card-back">{backContent}</div>
      </div>
    </div>
  )
}
