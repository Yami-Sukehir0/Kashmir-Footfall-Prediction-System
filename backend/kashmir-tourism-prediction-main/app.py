#!/usr/bin/env python3
"""
FastAPI Application for Kashmir Tourism Footfall Prediction
COMPLETE VERSION - Uses all 22 features for location-specific, temporal predictions
"""

import os
import sys
import logging
import joblib
import numpy as np
import traceback
from pathlib import Path
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# ============================================================
# SETUP LOGGING
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================
# LOCATION ENCODING MAPPING
# ============================================================
# Matches encoding from feature_engineering.py (alphabetically sorted)
LOCATION_MAPPING = {
    'Aharbal': 1,
    'Doodpathri': 2,
    'Gulmarg': 3,
    'Gurez': 4,
    'Kokernag': 5,
    'Lolab': 6,
    'Lolab, Bungus, Keran, Teetwal': 6,  # Alias
    'Manasbal': 7,
    'Pahalgam': 8,
    'Sonamarg': 9,
    'Yousmarg': 10
}

# Reverse mapping for display
LOCATION_NAMES = {v: k for k, v in LOCATION_MAPPING.items() if ', ' not in k}

# ============================================================
# MODEL PATHS & GLOBAL VARIABLES
# ============================================================
MODEL_PATH = "models/best_model/model.pkl"
SCALER_PATH = "models/scaler.pkl"
METADATA_PATH = "models/best_model_metadata.pkl"

# Global variables (loaded at startup)
model = None
scaler = None
feature_names = None
metadata = None


# ============================================================
# PYDANTIC MODELS
# ============================================================
class PredictionRequest(BaseModel):
    """Request model for predictions"""
    location: str
    year: int
    month: int

    # Optional parameters (will be estimated if not provided)
    season: Optional[int] = None
    footfall_rolling_avg: Optional[float] = None

    # Weather parameters (with defaults)
    temperature_2m_mean: float = 15.0
    temperature_2m_max: float = 20.0
    temperature_2m_min: float = 10.0
    precipitation_sum: float = 0.0
    snowfall_sum: float = 0.0
    precipitation_hours: int = 0
    windgusts_10m_max: float = 10.0
    relative_humidity_2m_mean: float = 60.0
    sunshine_duration: float = 8.0

    # Holiday parameters (with defaults)
    holiday_count: int = 0
    long_weekend_count: int = 0
    national_holiday_count: int = 0
    festival_holiday_count: int = 0
    days_to_next_holiday: int = 7


class PredictionResponse(BaseModel):
    """Response model for predictions"""
    predicted_footfall: int
    confidence: str
    message: str
    location: str
    year: int
    month: int
    month_name: str


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    num_features: int
    feature_names: list


# ============================================================
# HELPER FUNCTIONS
# ============================================================
def get_location_code(location_name: str) -> int:
    """
    Convert location name to encoded value

    Args:
        location_name: Name of the location (case-insensitive)

    Returns:
        Encoded location value (1-10)

    Raises:
        ValueError: If location not found
    """
    # Normalize
    location_normalized = location_name.lower().strip()

    # Try exact match
    for name, code in LOCATION_MAPPING.items():
        if name.lower() == location_normalized:
            return code

    # Try partial match
    for name, code in LOCATION_MAPPING.items():
        if location_normalized in name.lower():
            return code

    # Not found
    valid_locations = [k for k in LOCATION_MAPPING.keys() if ', ' not in k]
    raise ValueError(
        f"Location '{location_name}' not recognized. "
        f"Valid locations: {', '.join(valid_locations)}"
    )


def auto_calculate_season(month: int) -> int:
    """Calculate season from month"""
    if month in [12, 1, 2]:
        return 1  # Winter
    elif month in [3, 4, 5]:
        return 2  # Spring
    elif month in [6, 7, 8]:
        return 3  # Summer
    else:
        return 4  # Autumn


def estimate_footfall_rolling_avg(location_encoded: int) -> float:
    """
    Estimate rolling average footfall based on historical data
    Returns ACTUAL value (NOT log-transformed) as expected by training data
    """
    # Based on actual training data averages
    baseline_footfall = {
        1: 75000,  # Aharbal
        2: 150000,  # Doodpathri
        3: 120000,  # Gulmarg
        4: 12000,  # Gurez
        5: 70000,  # Kokernag
        6: 30000,  # Lolab
        7: 35000,  # Manasbal
        8: 86000,  # Pahalgam (typical for July)
        9: 60000,  # Sonamarg
        10: 28000  # Yousmarg
    }

    # Return ACTUAL value (NOT log-transformed)
    return float(baseline_footfall.get(location_encoded, 50000))


def build_feature_vector(request: PredictionRequest) -> np.ndarray:
    """
    Build feature vector in exact order expected by model

    Args:
        request: Prediction request

    Returns:
        Feature array matching training order
    """
    # Encode location
    location_encoded = get_location_code(request.location)
    logger.info(f"Location '{request.location}' encoded as {location_encoded}")

    # Auto-calculate season if not provided
    if request.season is None:
        season = auto_calculate_season(request.month)
        logger.info(f"Auto-calculated season: {season} for month {request.month}")
    else:
        season = request.season

    # Handle footfall_rolling_avg (use ACTUAL scale, NO log transform)
    if request.footfall_rolling_avg is None:
        # Estimate based on location
        footfall_rolling_avg = estimate_footfall_rolling_avg(location_encoded)
        logger.info(f"Estimated footfall_rolling_avg: {footfall_rolling_avg:,.0f}")
    else:
        # User provided - use as-is (training data expects actual scale)
        footfall_rolling_avg = request.footfall_rolling_avg
        logger.info(f"Using provided footfall_rolling_avg: {footfall_rolling_avg:,.0f}")

    # Calculate derived features
    temp_range = request.temperature_2m_max - request.temperature_2m_min
    temp_sunshine_interaction = request.temperature_2m_mean * request.sunshine_duration
    precip_temp_interaction = request.precipitation_sum * request.temperature_2m_mean

    # Build feature dictionary matching training CSV column order
    # Order: location_encoded, year, month, season, footfall_rolling_avg,
    #        temperature_2m_mean, temperature_2m_max, temperature_2m_min,
    #        precipitation_sum, snowfall_sum, precipitation_hours, windgusts_10m_max,
    #        relative_humidity_2m_mean, sunshine_duration, temp_sunshine_interaction,
    #        temperature_range, precipitation_temperature, holiday_count,
    #        long_weekend_count, national_holiday_count, festival_holiday_count,
    #        days_to_next_holiday

    feature_dict = {
        'location_encoded': location_encoded,
        'year': request.year,
        'month': request.month,
        'season': season,
        'footfall_rolling_avg': footfall_rolling_avg,
        'temperature_2m_mean': request.temperature_2m_mean,
        'temperature_2m_max': request.temperature_2m_max,
        'temperature_2m_min': request.temperature_2m_min,
        'precipitation_sum': request.precipitation_sum,
        'snowfall_sum': request.snowfall_sum,
        'precipitation_hours': request.precipitation_hours,
        'windgusts_10m_max': request.windgusts_10m_max,
        'relative_humidity_2m_mean': request.relative_humidity_2m_mean,
        'sunshine_duration': request.sunshine_duration,
        'temp_sunshine_interaction': temp_sunshine_interaction,
        'temperature_range': temp_range,
        'precipitation_temperature': precip_temp_interaction,
        'holiday_count': request.holiday_count,
        'long_weekend_count': request.long_weekend_count,
        'national_holiday_count': request.national_holiday_count,
        'festival_holiday_count': request.festival_holiday_count,
        'days_to_next_holiday': request.days_to_next_holiday
    }

    # Build feature array in EXACT order from metadata
    features = np.array([[feature_dict[name] for name in feature_names]])

    logger.info(f"Feature vector shape: {features.shape}")
    logger.info(f"Feature values: {features[0][:5]}... (first 5 shown)")

    return features


# ============================================================
# LIFESPAN MANAGER
# ============================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models at startup and clean up at shutdown"""
    global model, scaler, feature_names, metadata

    logger.info("=" * 80)
    logger.info("KASHMIR TOURISM FOOTFALL PREDICTION API v3.0")
    logger.info("COMPLETE FEATURE SET VERSION")
    logger.info("=" * 80)
    logger.info("Loading models at startup...")

    try:
        # Load model
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
        model = joblib.load(MODEL_PATH)
        logger.info(f"✓ Model loaded: {MODEL_PATH}")

        # Load scaler
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler not found: {SCALER_PATH}")
        scaler = joblib.load(SCALER_PATH)
        logger.info(f"✓ Scaler loaded: {SCALER_PATH}")

        # Load metadata
        if not os.path.exists(METADATA_PATH):
            raise FileNotFoundError(f"Metadata not found: {METADATA_PATH}")
        metadata = joblib.load(METADATA_PATH)
        feature_names = metadata['feature_names']

        logger.info(f"✓ Metadata loaded:")
        logger.info(f"     - Model type: {metadata.get('model_type', 'unknown')}")
        logger.info(f"     - Features: {len(feature_names)}")
        logger.info(f"     - Trained at: {metadata.get('trained_at', 'unknown')}")

        logger.info(f"\n  Feature names ({len(feature_names)}):")
        for i, name in enumerate(feature_names, 1):
            logger.info(f"     {i:2d}. {name}")

        logger.info("=" * 80)
        logger.info(f"✓ Supported locations: {list(LOCATION_NAMES.values())}")
        logger.info("=" * 80)
        logger.info("✓ API ready to serve predictions!")
        logger.info("=" * 80)

    except Exception as e:
        logger.error(f"[ERROR] Failed to load models: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise

    yield  # API runs here

    logger.info("Shutting down - cleaning up resources...")


# ============================================================
# INITIALIZE FASTAPI APP
# ============================================================
app = FastAPI(
    title="Kashmir Tourism Footfall Prediction API",
    description="ML-powered API for predicting tourist footfall with complete feature set",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ============================================================
# CORS CONFIGURATION
# ============================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# API ENDPOINTS
# ============================================================

@app.get("/", tags=["Root"])
def read_root():
    """Root endpoint"""
    return {
        "name": "Kashmir Tourism Footfall Prediction API",
        "version": "3.0.0",
        "description": "Complete feature set - location + time + weather + holidays",
        "status": "running",
        "model_loaded": model is not None,
        "num_features": len(feature_names) if feature_names else 0,
        "supported_locations": list(LOCATION_NAMES.values()),
        "endpoints": {
            "health": "/health",
            "locations": "/locations",
            "predict": "/predict",
            "documentation": "/docs"
        }
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
def health_check():
    """Health check endpoint"""
    if model is None or scaler is None or feature_names is None:
        raise HTTPException(status_code=503, detail="Models not loaded")

    return HealthCheckResponse(
        status="healthy",
        model_loaded=True,
        num_features=len(feature_names),
        feature_names=feature_names
    )


@app.get("/locations", tags=["Locations"])
def get_locations():
    """Get list of supported locations"""
    return {
        "locations": [
            {"name": name, "code": code}
            for code, name in sorted(LOCATION_NAMES.items())
        ],
        "total": len(LOCATION_NAMES)
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Predictions"])
async def predict_footfall(request: PredictionRequest):
    """
    Predict tourist footfall for a specific location, month, and year

    **Required:**
    - location: Tourist destination name
    - year: Year (e.g., 2024, 2025)
    - month: Month (1-12)

    **Optional:**
    - season: Season code (1=Winter, 2=Spring, 3=Summer, 4=Autumn) - auto-calculated if omitted
    - footfall_rolling_avg: Historical rolling average - estimated if omitted
    - Weather parameters: temperature, precipitation, etc.
    - Holiday parameters: holiday counts, days to next holiday

    **Returns:**
    - Predicted footfall for the specified location and time
    """
    try:
        logger.info("=" * 80)
        logger.info(f"Prediction request: {request.location} - {request.month}/{request.year}")

        # Validate models loaded
        if model is None or scaler is None or feature_names is None:
            raise RuntimeError("Models not loaded")

        # Validate inputs
        if not (2017 <= request.year <= 2035):
            raise ValueError(f"Year must be between 2017 and 2035, got {request.year}")
        if not (1 <= request.month <= 12):
            raise ValueError(f"Month must be between 1 and 12, got {request.month}")

        # Build feature vector
        features = build_feature_vector(request)

        # Scale features
        features_scaled = scaler.transform(features)
        logger.info("Features scaled")

        # Predict
        prediction_log = model.predict(features_scaled)[0]
        logger.info(f"Raw prediction (log): {prediction_log:.4f}")

        # Inverse transform (log -> actual)
        prediction_actual = int(np.expm1(prediction_log))
        logger.info(f"Inverse transform: {prediction_actual:,}")

        # Ensure minimum value
        prediction_actual = max(1000, prediction_actual)

        # Determine confidence based on magnitude
        if prediction_actual > 500000:
            confidence = "high"
        elif prediction_actual > 100000:
            confidence = "medium"
        else:
            confidence = "low"

        # Create response message
        month_name = datetime(request.year, request.month, 1).strftime("%B")
        message = f"Predicted {prediction_actual:,} visitors in {request.location} for {month_name} {request.year}"

        logger.info(f"✓ {message} (confidence: {confidence})")
        logger.info("=" * 80)

        return PredictionResponse(
            predicted_footfall=prediction_actual,
            confidence=confidence,
            message=message,
            location=request.location,
            year=request.year,
            month=request.month,
            month_name=month_name
        )

    except ValueError as ve:
        logger.warning(f"[WARN] Invalid input: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"[ERROR] Prediction failed: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# RUN SERVER
# ============================================================
if __name__ == "__main__":
    import uvicorn

    logger.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
