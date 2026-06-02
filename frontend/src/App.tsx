import { useState, useEffect } from 'react'
import Header from './components/Header'
import ModeToggle from './components/ModeToggle'
import ModelToggle from './components/ModelToggle'
import DriverCard from './components/DriverCard'
import CircuitCard from './components/CircuitCard'
import GridCard from './components/GridCard'
import CompoundCard from './components/CompoundCard'
import RaceInfoCard from './components/RaceInfoCard'
import WeatherCard from './components/WeatherCard'
import PredictControls from './components/PredictControls'
import PredictionResult from './components/PredictionResult'
import HistoricalView from './components/HistoricalView'
import CompareView from './components/CompareView'
import { api } from './api/client'
import {
  Driver, Circuit, Compound, AppMode, ModelType,
  PredictionResponse, HistoricalRaceSummary,
} from './types'

export default function App() {
  const [mode, setMode] = useState<AppMode>('predict')
  const [modelType, setModelType] = useState<ModelType>('B')

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [circuits, setCircuits] = useState<Circuit[]>([])

  const [selectedDriverAbbrev, setSelectedDriverAbbrev] = useState('')
  const [selectedCircuitName, setSelectedCircuitName] = useState('')
  const [gridPosition, setGridPosition] = useState<number | null>(null)
  const [selectedCompound, setSelectedCompound] = useState<Compound | null>(null)
  const [season] = useState(2025)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const [historicalSummary, setHistoricalSummary] = useState<HistoricalRaceSummary | null>(null)

  const [compareDriverAbbrev, setCompareDriverAbbrev] = useState('')
  const [compareCircuitSlug, setCompareCircuitSlug] = useState('')

  useEffect(() => {
    api.getDrivers().then(setDrivers)
    api.getCircuits().then(setCircuits)
  }, [])

  const predictDriver  = drivers.find(d => d.abbrev === selectedDriverAbbrev) ?? null
  const predictCircuit = circuits.find(c => c.name === selectedCircuitName) ?? null

  const histWinner  = historicalSummary
    ? (drivers.find(d => d.abbrev === historicalSummary.winner_abbrev) ?? null)
    : null
  const histCircuit = historicalSummary
    ? (circuits.find(c => c.name === historicalSummary.event_name) ?? null)
    : null

  const compareDriver  = drivers.find(d => d.abbrev === compareDriverAbbrev) ?? null
  const compareCircuit = circuits.find(c => c.slug === compareCircuitSlug) ?? null

  const handlePredict = async () => {
    if (!selectedDriverAbbrev || !selectedCircuitName || gridPosition === null || !selectedCompound) return
    setLoading(true)
    setPrediction(null)
    try {
      const result = await api.predict({
        driver: selectedDriverAbbrev,
        circuit: selectedCircuitName,
        grid_position: gridPosition,
        compound: selectedCompound,
        season,
        model: modelType,
      })
      setPrediction(result)
    } finally {
      setLoading(false)
    }
  }

  const headerMae      = prediction ? prediction.model_mae      : (modelType === 'B' ? 2.5  : 3.3)
  const headerSpearman = prediction ? prediction.model_spearman : (modelType === 'B' ? 0.80 : 0.64)

  // Controls container glass style (spec §6)
  const controlsGlass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    padding: 24,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header mae={headerMae} spearman={headerSpearman} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-24 pb-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <ModeToggle mode={mode} onChange={m => { setMode(m); setPrediction(null) }} />
          {mode === 'predict' && (
            <ModelToggle model={modelType} onChange={m => { setModelType(m); setPrediction(null) }} />
          )}
        </div>

        {/* Card row — always 200×280px, centred in their columns */}
        {mode === 'compare' ? (
          <div className="flex gap-4 justify-center">
            <DriverCard driver={compareDriver} />
            <CircuitCard circuit={compareCircuit} />
          </div>
        ) : mode === 'historical' ? (
          <div className={`flex gap-4 justify-center${loading ? ' cards-loading' : ''}`}>
            <DriverCard driver={histWinner} />
            <CircuitCard circuit={histCircuit} />
            <RaceInfoCard summary={historicalSummary} />
            <WeatherCard isWet={historicalSummary?.is_wet ?? null} />
          </div>
        ) : (
          <div className={`flex gap-4 justify-center${loading ? ' cards-loading' : ''}`}>
            <DriverCard driver={predictDriver} />
            <CircuitCard circuit={predictCircuit} />
            <GridCard position={gridPosition} team={predictDriver?.team} />
            <CompoundCard compound={selectedCompound} />
          </div>
        )}

        {mode === 'predict' && (
          <div className="flex flex-col gap-4">
            <div style={controlsGlass}>
              <PredictControls
                drivers={drivers}
                circuits={circuits}
                selectedDriver={selectedDriverAbbrev}
                selectedCircuit={selectedCircuitName}
                gridPosition={gridPosition}
                selectedCompound={selectedCompound}
                onDriverChange={setSelectedDriverAbbrev}
                onCircuitChange={setSelectedCircuitName}
                onGridChange={setGridPosition}
                onCompoundChange={setSelectedCompound}
                onPredict={handlePredict}
                loading={loading}
              />
            </div>
            {prediction && <PredictionResult result={prediction} />}
          </div>
        )}

        {mode === 'historical' && (
          <HistoricalView onRaceData={setHistoricalSummary} />
        )}

        {mode === 'compare' && (
          <CompareView
            drivers={drivers}
            circuits={circuits}
            selectedDriver={compareDriverAbbrev}
            selectedCircuit={compareCircuitSlug}
            onDriverChange={setCompareDriverAbbrev}
            onCircuitChange={setCompareCircuitSlug}
          />
        )}
      </main>

      <footer className="footer" />
    </div>
  )
}
