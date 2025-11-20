# Kashmir Tourism Backend API

Python Flask API serving ML predictions.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Place Your Model Files

Copy your trained model files to:
```
backend/models/
  ├── best_model/
  │   └── model.pkl
  ├── scaler.pkl
  └── best_model_metadata.pkl
```

## Run

```bash
python app.py
```

API will run on http://localhost:5000

## Endpoints

- `GET /api/health` - Health check
- `POST /api/predict` - Predict footfall
- `GET /api/locations` - Get locations list

## Example Request

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Gulmarg",
    "year": 2024,
    "month": 12,
    "rolling_avg": 95000
  }'
```
