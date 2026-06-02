export interface Driver {
  abbrev: string
  name: string
  team: string
  number: number
}

export interface Circuit {
  name: string
  slug: string
  country: string
  flag: string
  is_street: boolean
}

export interface ShapFeature {
  feature: string
  shap_value: number
}

export interface PredictionResponse {
  predicted_position: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  model_used: string
  model_mae: number
  model_spearman: number
  top_features: ShapFeature[]
}

export interface RaceResult {
  position: number | null
  driver: string
  team: string
  grid: number
  status: string
  points: number
}

export interface HistoricalRace {
  season: number
  round: number
  event_name: string
  is_wet: boolean
  total_race_laps: number
  date: string
  driver_count: number
  results: RaceResult[]
}

export interface HistoricalRaceSummary {
  winner_abbrev: string
  event_name: string
  is_wet: boolean
  total_race_laps: number
  driver_count: number
  date: string
}

export interface SeasonRace {
  round: number
  event_name: string
  date: string
  location: string
}

export interface CompareResult {
  season: number
  position: number | null
  dnf: boolean
  grid: number
}

export type AppMode = 'predict' | 'historical' | 'compare'
export type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET'
export type ModelType = 'A' | 'B'
