# F1 Era Predictor

**Thesis:** "An Explainable ML Analysis of Race Outcome Determinants in the 2022–2025 F1 Ground Effect Era"

## Phase 1 — Scaffold (current)
Mock predictions, all UI components, full design system.

## Running

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: http://localhost:5173

## Phases
- **Phase 1:** Scaffold + shell (current) — mock model
- **Phase 2:** Real ML models — swap `predictor.py`, add `race_features.csv`
- **Phase 3:** Real assets — driver photos, circuit maps, flag images, tyre images
