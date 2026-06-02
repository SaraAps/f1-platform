from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from data import DRIVERS, CIRCUITS, COMPOUNDS, SEASONS
from predictor import predict
from assembler import get_historical_results, get_compare_results, get_season_races

app = FastAPI(title='F1 Era Predictor API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_methods=['*'],
    allow_headers=['*'],
)


class PredictRequest(BaseModel):
    driver: str
    circuit: str
    grid_position: int
    compound: str
    season: int
    model: Optional[str] = 'B'



from predictor import _loaded
from pathlib import Path

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": _loaded,
        "files": {
            "model_a": Path("models/model_a.pkl").exists(),
            "model_b": Path("models/model_b.pkl").exists(),
            "encoders": Path("models/encoders.pkl").exists(),
            "imputer": Path("models/imputer.pkl").exists(),
            "race_features": Path("models/race_features.csv").exists(),
        }
    }


@app.get('/drivers')
def get_drivers():
    return DRIVERS


@app.get('/circuits')
def get_circuits():
    return CIRCUITS


@app.get('/seasons')
def get_seasons():
    return SEASONS


@app.get('/compounds')
def get_compounds():
    return COMPOUNDS


@app.post('/predict')
def predict_endpoint(req: PredictRequest):
    circuit_data = next((c for c in CIRCUITS if c['name'] == req.circuit), None)
    is_street = circuit_data['is_street'] if circuit_data else False
    return predict(
        req.driver, req.circuit, req.grid_position,
        req.compound, req.season, is_street, req.model or 'B',
    )


@app.get('/races/{season}')
def get_races(season: int):
    return get_season_races(season)


@app.get('/historical/{season}/{round_number}')
def get_historical(season: int, round_number: int):
    result = get_historical_results(season, round_number)
    if result is None:
        raise HTTPException(status_code=404, detail='No data for this season/round')
    return result


@app.get('/compare/{driver}/{circuit_slug}')
def compare(driver: str, circuit_slug: str):
    circuit_data = next((c for c in CIRCUITS if c['slug'] == circuit_slug), None)
    if circuit_data is None:
        raise HTTPException(status_code=404, detail=f'Unknown circuit slug: {circuit_slug}')
    results = get_compare_results(driver, circuit_data['name'])
    return {'driver': driver, 'circuit_slug': circuit_slug, 'results': results}
