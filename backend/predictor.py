import json
import os
import pickle
import random

import numpy as np
import pandas as pd

from assembler import (
    encode_compound,
    get_circuit_stats,
    get_driver_context,
    find_race_row,
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')

# ── Human-readable names for feature columns ───────────────────────────────
FEATURE_NAMES = {
    'grid_position':                    'Grid Position',
    'season':                           'Season',
    'total_race_laps':                  'Race Length (laps)',
    'is_street_circuit':                'Street Circuit',
    'driver_rolling_avg_3':             'Driver Form (3-race avg)',
    'driver_rolling_avg_5':             'Driver Form (5-race avg)',
    'driver_dnf_rate_season':           'Driver DNF Rate',
    'driver_encoded':                   'Driver Identity',
    'constructor_rolling_avg_points_3': 'Constructor Form (3-race)',
    'constructor_season_points':        'Constructor Season Points',
    'team_encoded':                     'Team Identity',
    'compound_encoded':                 'Starting Compound',
    'is_wet_race':                      'Wet Race',
    'num_pit_stops':                    'Pit Stops',
    'safety_car_deployed':              'Safety Car',
    'vsc_deployed':                     'Virtual SC',
    'red_flag':                         'Red Flag',
    'avg_air_temp':                     'Air Temperature',
    'avg_track_temp':                   'Track Temperature',
    'median_lap_time':                  'Median Lap Time',
    'pace_delta':                       'Pace vs Field',
    'clean_pace_delta':                 'Clean Air Pace Delta',
    'teammate_pace_delta':              'Pace vs Teammate',
    'first_stint_len':                  'First Stint Length',
}

# ── Module-level state ──────────────────────────────────────────────────────
_loaded = False
_model_a = _model_b = None
_imputer_a = _imputer_b = None
_features_a = _features_b = None
_explainer_a = _explainer_b = None

MODEL_META = {
    'A': {'name': 'Pre-race Forecasting',        'mae': 3.332, 'spearman': 0.643},
    'B': {'name': 'Full Race Reconstruction',    'mae': 2.545, 'spearman': 0.803},
}


def _load_models():
    global _loaded, _model_a, _model_b, _imputer_a, _imputer_b
    global _features_a, _features_b, _explainer_a, _explainer_b
    try:
        import shap

        def _pkl(name):
            with open(os.path.join(MODELS_DIR, name), 'rb') as f:
                return pickle.load(f)

        _model_a    = _pkl('model_a.pkl')
        _model_b    = _pkl('model_b.pkl')
        _imputer_a  = _pkl('pre_race_imputer.pkl')
        _imputer_b  = _pkl('imputer.pkl')

        with open(os.path.join(MODELS_DIR, 'feature_list_a.json')) as f:
            _features_a = json.load(f)
        with open(os.path.join(MODELS_DIR, 'feature_list_b.json')) as f:
            _features_b = json.load(f)

        _explainer_a = shap.TreeExplainer(_model_a)
        _explainer_b = shap.TreeExplainer(_model_b)

        _loaded = True
        print(f'[predictor] Models loaded. A={len(_features_a)} feats, B={len(_features_b)} feats')
    except Exception as exc:
        print(f'[predictor] Model load failed ({exc}). Falling back to mock.')
        _loaded = False


_load_models()


# ── Encoder helper ──────────────────────────────────────────────────────────

def _encode_value(enc_obj, value, fallback: float = 0.0) -> float:
    """Encode a string value using a dict or sklearn LabelEncoder."""
    if isinstance(enc_obj, dict):
        return float(enc_obj.get(value, fallback))
    try:
        return float(enc_obj.transform([value])[0])
    except (ValueError, AttributeError):
        return fallback


# ── Build raw feature dict ──────────────────────────────────────────────────

def _build_raw(
    driver: str,
    circuit: str,
    grid_position: int,
    compound: str,
    season: int,
    is_street: bool,
    model: str,
) -> dict:
    compound_enc = encode_compound(compound)
    context      = get_driver_context(driver, circuit, season)
    circ         = get_circuit_stats(circuit)

    # Try to use actual race row (reconstruction mode for historical races)
    actual_row = find_race_row(driver, circuit, season)
    if actual_row is not None:
        row = actual_row
        raw = {
            'grid_position':                    float(grid_position),
            'season':                           float(season),
            'is_street_circuit':                float(row['is_street_circuit']),
            'total_race_laps':                  float(row['total_race_laps']),
            'is_wet_race':                      float(row['is_wet_race']),
            'avg_air_temp':                     float(row['avg_air_temp']),
            'avg_track_temp':                   float(row['avg_track_temp']),
            'median_lap_time':                  float(row['median_lap_time']),
            'safety_car_deployed':              float(row['safety_car_deployed']),
            'vsc_deployed':                     float(row['vsc_deployed']),
            'red_flag':                         float(row['red_flag']),
            'num_pit_stops':                    float(row['num_pit_stops']),
            'first_stint_len':                  float(row['first_stint_len']),
            'pace_delta':                       float(row['pace_delta']),
            'clean_pace_delta':                 float(row['clean_pace_delta']),
            'teammate_pace_delta':              float(row['teammate_pace_delta']),
            'driver_rolling_avg_3':             float(row['driver_rolling_avg_3']),
            'driver_rolling_avg_5':             float(row['driver_rolling_avg_5']),
            'driver_dnf_rate_season':           float(row['driver_dnf_rate_season']),
            'constructor_rolling_avg_points_3': float(row['constructor_rolling_avg_points_3']),
            'constructor_season_points':        float(row['constructor_season_points']),
            'driver_encoded':                   float(row['driver_encoded']),
            'team_encoded':                     float(row['team_encoded']),
            'compound_encoded':                 compound_enc,
        }
    else:
        raw = {
            'grid_position':                    float(grid_position),
            'season':                           float(season),
            'is_street_circuit':                float(int(is_street)),
            'total_race_laps':                  circ['total_race_laps'],
            'is_wet_race':                      float(circ['is_wet_race']),
            'avg_air_temp':                     circ['avg_air_temp'],
            'avg_track_temp':                   circ['avg_track_temp'],
            'median_lap_time':                  circ['median_lap_time'],
            'safety_car_deployed':              circ['safety_car_deployed'],
            'vsc_deployed':                     circ['vsc_deployed'],
            'red_flag':                         circ['red_flag'],
            'num_pit_stops':                    circ['num_pit_stops'],
            'first_stint_len':                  circ['first_stint_len'],
            'pace_delta':                       np.nan,
            'clean_pace_delta':                 np.nan,
            'teammate_pace_delta':              np.nan,
            'driver_rolling_avg_3':             context['driver_rolling_avg_3'],
            'driver_rolling_avg_5':             context['driver_rolling_avg_5'],
            'driver_dnf_rate_season':           context['driver_dnf_rate_season'],
            'constructor_rolling_avg_points_3': context['constructor_rolling_avg_points_3'],
            'constructor_season_points':        context['constructor_season_points'],
            'driver_encoded':                   context['driver_encoded'],
            'team_encoded':                     context['team_encoded'],
            'compound_encoded':                 compound_enc,
        }
    return raw


# ── Real prediction ──────────────────────────────────────────────────────────

def predict_real(
    driver: str,
    circuit: str,
    grid_position: int,
    compound: str,
    season: int,
    is_street: bool,
    model: str = 'B',
) -> dict:
    feature_list = _features_b if model == 'B' else _features_a
    imputer      = _imputer_b  if model == 'B' else _imputer_a
    model_obj    = _model_b    if model == 'B' else _model_a
    explainer    = _explainer_b if model == 'B' else _explainer_a
    meta         = MODEL_META[model]

    raw = _build_raw(driver, circuit, grid_position, compound, season, is_street, model)

    # Build DataFrame in the exact column order the model was trained on
    X = pd.DataFrame([{col: raw.get(col, np.nan) for col in feature_list}], columns=feature_list)
    X_imp = imputer.transform(X)

    raw_pred  = float(model_obj.predict(X_imp)[0])
    predicted = max(1, min(20, round(raw_pred)))

    confidence = 'HIGH' if grid_position <= 5 else 'MEDIUM' if grid_position <= 12 else 'LOW'

    # SHAP feature importance
    try:
        shap_vals = explainer.shap_values(X_imp)
        vals = shap_vals[0] if len(shap_vals.shape) == 2 else shap_vals  # type: ignore[union-attr]
        top_features = sorted(
            [
                {
                    'feature':    FEATURE_NAMES.get(col, col),
                    'shap_value': round(float(vals[i]), 3),
                }
                for i, col in enumerate(feature_list)
            ],
            key=lambda x: abs(x['shap_value']),
            reverse=True,
        )[:5]
    except Exception as exc:
        print(f'[predictor] SHAP failed: {exc}')
        importances = model_obj.feature_importances_
        top_features = sorted(
            [
                {
                    'feature':    FEATURE_NAMES.get(col, col),
                    'shap_value': round(float(importances[i]), 3),
                }
                for i, col in enumerate(feature_list)
            ],
            key=lambda x: abs(x['shap_value']),
            reverse=True,
        )[:5]

    return {
        'predicted_position': predicted,
        'confidence':         confidence,
        'model_used':         meta['name'],
        'model_mae':          meta['mae'],
        'model_spearman':     meta['spearman'],
        'top_features':       top_features,
    }


# ── Mock fallback (Phase 1, kept for when model files are missing) ───────────

def predict_mock(
    driver: str,
    circuit: str,
    grid_position: int,
    compound: str,
    season: int,
    is_street: bool,
    model: str = 'B',
) -> dict:
    random.seed(hash(f'{driver}{circuit}{grid_position}{model}'))
    noise     = random.randint(-2, 3) if model == 'B' else random.randint(-1, 5)
    predicted = max(1, min(20, grid_position + noise))
    confidence = 'HIGH' if grid_position <= 5 else 'MEDIUM' if grid_position <= 12 else 'LOW'
    meta       = MODEL_META[model]

    return {
        'predicted_position': predicted,
        'confidence':         confidence,
        'model_used':         meta['name'] + ' (mock)',
        'model_mae':          meta['mae'],
        'model_spearman':     meta['spearman'],
        'top_features': [
            {'feature': 'Grid Position',             'shap_value':  2.1},
            {'feature': 'Constructor Form (3-race)', 'shap_value':  1.4},
            {'feature': 'Driver Form (5-race avg)',  'shap_value':  0.8},
            {'feature': 'Street Circuit',            'shap_value':  0.6 if is_street else -0.2},
            {'feature': 'Starting Compound',         'shap_value': -0.4},
        ] if model == 'A' else [
            {'feature': 'Pace vs Field',             'shap_value':  1.6},
            {'feature': 'Clean Air Pace Delta',      'shap_value':  1.2},
            {'feature': 'Grid Position',             'shap_value':  0.6},
            {'feature': 'Driver Form (5-race avg)',  'shap_value':  0.4},
            {'feature': 'Pace vs Teammate',          'shap_value':  0.4},
        ],
    }


# ── Public interface ─────────────────────────────────────────────────────────

def predict(
    driver: str,
    circuit: str,
    grid_position: int,
    compound: str,
    season: int,
    is_street: bool,
    model: str = 'B',
) -> dict:
    if _loaded:
        return predict_real(driver, circuit, grid_position, compound, season, is_street, model)
    return predict_mock(driver, circuit, grid_position, compound, season, is_street, model)
