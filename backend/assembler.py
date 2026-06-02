import os
import pandas as pd
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')

_df: pd.DataFrame | None = None
_neutral: dict = {}
_compound_map: dict = {}    # first_stint_compound -> compound_encoded
_circuit_stats_cache: dict = {}


def _load():
    global _df, _neutral, _compound_map
    path = os.path.join(MODELS_DIR, 'race_features.csv')
    _df = pd.read_csv(path)
    _compound_map = (
        _df.dropna(subset=['first_stint_compound', 'compound_encoded'])
        .groupby('first_stint_compound')['compound_encoded']
        .first()
        .to_dict()
    )
    _neutral = {
        'driver_rolling_avg_3':          float(_df['driver_rolling_avg_3'].median()),
        'driver_rolling_avg_5':          float(_df['driver_rolling_avg_5'].median()),
        'driver_dnf_rate_season':        float(_df['driver_dnf_rate_season'].median()),
        'constructor_rolling_avg_points_3': float(_df['constructor_rolling_avg_points_3'].median()),
        'constructor_season_points':     float(_df['constructor_season_points'].median()),
        'driver_encoded':                float(_df['driver_encoded'].median()),
        'team_encoded':                  float(_df['team_encoded'].median()),
    }
    print(f'[assembler] Loaded {len(_df)} rows | compounds: {_compound_map}')


_load()


def get_df() -> pd.DataFrame:
    return _df  # type: ignore[return-value]


def encode_compound(compound: str) -> float:
    """Map compound name to its integer encoding derived from the CSV."""
    return float(_compound_map.get(compound.upper(), _compound_map.get('MEDIUM', 2.0)))


def get_driver_context(driver_abbrev: str, circuit_name: str, season: int) -> dict:
    """
    Return the most recent pre-race rolling stats for this driver.
    Looks at all rows with season < target_season for this driver,
    then falls back to same-season rows, then to training medians.
    """
    df = _df
    prior = df[(df['driver_abbrev'] == driver_abbrev) & (df['season'] < season)]
    if prior.empty:
        prior = df[(df['driver_abbrev'] == driver_abbrev) & (df['season'] == season)]
    if prior.empty:
        return dict(_neutral)

    row = prior.sort_values(['season', 'round'], ascending=[False, False]).iloc[0]
    return {
        'driver_rolling_avg_3':          float(row['driver_rolling_avg_3']),
        'driver_rolling_avg_5':          float(row['driver_rolling_avg_5']),
        'driver_dnf_rate_season':        float(row['driver_dnf_rate_season']),
        'constructor_rolling_avg_points_3': float(row['constructor_rolling_avg_points_3']),
        'constructor_season_points':     float(row['constructor_season_points']),
        'driver_encoded':                float(row['driver_encoded']),
        'team_encoded':                  float(row['team_encoded']),
    }


def get_circuit_stats(circuit_name: str) -> dict:
    """Return median race-day conditions for a circuit across all seasons."""
    if circuit_name in _circuit_stats_cache:
        return _circuit_stats_cache[circuit_name]

    df = _df
    rows = df[df['event_name'] == circuit_name]
    src = rows if not rows.empty else df  # fall back to global medians

    stats = {
        'total_race_laps':       float(src['total_race_laps'].median()),
        'avg_air_temp':          float(src['avg_air_temp'].median()),
        'avg_track_temp':        float(src['avg_track_temp'].median()),
        'median_lap_time':       float(src['median_lap_time'].median()),
        'is_wet_race':           int(src['is_wet_race'].mean() > 0.3),
        'safety_car_deployed':   float(src['safety_car_deployed'].mean()),
        'vsc_deployed':          float(src['vsc_deployed'].mean()),
        'red_flag':              float(src['red_flag'].mean()),
        'num_pit_stops':         float(src['num_pit_stops'].median()),
        'first_stint_len':       float(src['first_stint_len'].median()),
    }
    _circuit_stats_cache[circuit_name] = stats
    return stats


def find_race_row(driver_abbrev: str, circuit_name: str, season: int):
    """Return the actual race row for driver/circuit/season, or None."""
    df = _df
    matches = df[
        (df['driver_abbrev'] == driver_abbrev) &
        (df['event_name'] == circuit_name) &
        (df['season'] == season)
    ]
    return matches.iloc[0] if not matches.empty else None


def get_season_races(season: int) -> list:
    """Return one entry per round for a season, sorted by round."""
    df = _df
    rows = (
        df[df['season'] == season][['round', 'event_name', 'date', 'location']]
        .drop_duplicates(subset=['round'])
        .sort_values('round')
    )
    return [
        {
            'round':      int(r['round']),
            'event_name': str(r['event_name']),
            'date':       str(r['date'])[:10],
            'location':   str(r['location']),
        }
        for _, r in rows.iterrows()
    ]


def get_historical_results(season: int, round_number: int) -> dict | None:
    """Return all race results for a season+round from the CSV."""
    df = _df
    rows = df[(df['season'] == season) & (df['round'] == round_number)]
    if rows.empty:
        return None

    first = rows.iloc[0]
    event_name     = str(first['event_name'])
    is_wet         = bool(first.get('is_wet_race', 0))
    total_laps     = int(first['total_race_laps']) if pd.notna(first['total_race_laps']) else 0
    date           = str(first.get('date', ''))[:10]
    driver_count   = len(rows)

    results = []
    for _, r in rows.sort_values('final_position').iterrows():
        pos = int(r['final_position']) if pd.notna(r['final_position']) else None
        results.append({
            'position': pos,
            'driver':   str(r['driver_abbrev']),
            'team':     str(r['team']),
            'grid':     int(r['grid_position']) if pd.notna(r['grid_position']) else 0,
            'status':   str(r['status']),
            'points':   int(r['points_scored']) if pd.notna(r['points_scored']) else 0,
        })
    return {
        'season':           season,
        'round':            round_number,
        'event_name':       event_name,
        'is_wet':           is_wet,
        'total_race_laps':  total_laps,
        'date':             date,
        'driver_count':     driver_count,
        'results':          results,
    }


def get_compare_results(driver_abbrev: str, circuit_name: str) -> list:
    """Return per-season results for driver at circuit."""
    df = _df
    rows = df[
        (df['driver_abbrev'] == driver_abbrev) &
        (df['event_name'] == circuit_name)
    ].sort_values('season')

    results = []
    for _, r in rows.iterrows():
        dnf = bool(r['dnf'])
        results.append({
            'season':   int(r['season']),
            'position': None if dnf else int(r['final_position']),
            'dnf':      dnf,
            'grid':     int(r['grid_position']),
        })
    return results
