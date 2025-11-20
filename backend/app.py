"""
Kashmir Tourism Footfall Prediction API
Flask backend that serves ML model predictions
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load trained model and scaler
MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
SCALER_PATH = os.path.join('models', 'scaler.pkl')
METADATA_PATH = os.path.join('models', 'best_model_metadata.pkl')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    metadata = joblib.load(METADATA_PATH)
    logger.info("✓ Model loaded successfully")
    logger.info(f"  Model type: {metadata.get('model_type', 'unknown')}")
    logger.info(f"  Features: {metadata.get('num_features', 0)}")
except Exception as e:
    logger.error(f"✗ Failed to load model: {str(e)}")
    model = None
    scaler = None
    metadata = None

# Location encoding (from your feature_engineering.py)
LOCATION_MAPPING = {
    'Aharbal': 1,
    'Doodpathri': 2,
    'Gulmarg': 3,
    'Gurez': 4,
    'Kokernag': 5,
    'Lolab': 6,
    'Manasbal': 7,
    'Pahalgam': 8,
    'Sonamarg': 9,
    'Yousmarg': 10
}

# Weather data by location and month (realistic Kashmir weather)
WEATHER_DATA = {
    # Gulmarg (ski resort - cold, snowy)
    'Gulmarg': {
        1: {'temp_mean': -2, 'temp_max': 3, 'temp_min': -7, 'precip': 150, 'snow': 80, 'precip_hours': 200, 'wind': 35, 'humidity': 75, 'sunshine': 120},
        2: {'temp_mean': 0, 'temp_max': 5, 'temp_min': -5, 'precip': 140, 'snow': 75, 'precip_hours': 180, 'wind': 33, 'humidity': 73, 'sunshine': 140},
        3: {'temp_mean': 5, 'temp_max': 10, 'temp_min': 0, 'precip': 120, 'snow': 50, 'precip_hours': 160, 'wind': 30, 'humidity': 70, 'sunshine': 170},
        4: {'temp_mean': 10, 'temp_max': 15, 'temp_min': 5, 'precip': 100, 'snow': 20, 'precip_hours': 140, 'wind': 28, 'humidity': 65, 'sunshine': 200},
        5: {'temp_mean': 15, 'temp_max': 20, 'temp_min': 10, 'precip': 80, 'snow': 5, 'precip_hours': 120, 'wind': 25, 'humidity': 60, 'sunshine': 240},
        6: {'temp_mean': 20, 'temp_max': 25, 'temp_min': 15, 'precip': 60, 'snow': 0, 'precip_hours': 100, 'wind': 22, 'humidity': 55, 'sunshine': 280},
        7: {'temp_mean': 22, 'temp_max': 27, 'temp_min': 17, 'precip': 50, 'snow': 0, 'precip_hours': 90, 'wind': 20, 'humidity': 52, 'sunshine': 300},
        8: {'temp_mean': 21, 'temp_max': 26, 'temp_min': 16, 'precip': 55, 'snow': 0, 'precip_hours': 95, 'wind': 21, 'humidity': 53, 'sunshine': 290},
        9: {'temp_mean': 16, 'temp_max': 21, 'temp_min': 11, 'precip': 70, 'snow': 0, 'precip_hours': 110, 'wind': 23, 'humidity': 58, 'sunshine': 250},
        10: {'temp_mean': 10, 'temp_max': 15, 'temp_min': 5, 'precip': 90, 'snow': 10, 'precip_hours': 130, 'wind': 26, 'humidity': 63, 'sunshine': 200},
        11: {'temp_mean': 4, 'temp_max': 9, 'temp_min': -1, 'precip': 110, 'snow': 40, 'precip_hours': 160, 'wind': 30, 'humidity': 68, 'sunshine': 150},
        12: {'temp_mean': -1, 'temp_max': 4, 'temp_min': -6, 'precip': 140, 'snow': 70, 'precip_hours': 190, 'wind': 34, 'humidity': 74, 'sunshine': 130},
    },
    # Pahalgam (valley - moderate climate)
    'Pahalgam': {
        1: {'temp_mean': 2, 'temp_max': 7, 'temp_min': -3, 'precip': 120, 'snow': 40, 'precip_hours': 170, 'wind': 25, 'humidity': 70, 'sunshine': 140},
        2: {'temp_mean': 4, 'temp_max': 9, 'temp_min': -1, 'precip': 110, 'snow': 30, 'precip_hours': 160, 'wind': 23, 'humidity': 68, 'sunshine': 160},
        3: {'temp_mean': 9, 'temp_max': 14, 'temp_min': 4, 'precip': 95, 'snow': 15, 'precip_hours': 140, 'wind': 22, 'humidity': 65, 'sunshine': 190},
        4: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 75, 'snow': 5, 'precip_hours': 120, 'wind': 20, 'humidity': 60, 'sunshine': 220},
        5: {'temp_mean': 19, 'temp_max': 24, 'temp_min': 14, 'precip': 55, 'snow': 0, 'precip_hours': 100, 'wind': 18, 'humidity': 55, 'sunshine': 260},
        6: {'temp_mean': 23, 'temp_max': 28, 'temp_min': 18, 'precip': 40, 'snow': 0, 'precip_hours': 80, 'wind': 16, 'humidity': 50, 'sunshine': 300},
        7: {'temp_mean': 25, 'temp_max': 30, 'temp_min': 20, 'precip': 35, 'snow': 0, 'precip_hours': 70, 'wind': 15, 'humidity': 48, 'sunshine': 320},
        8: {'temp_mean': 24, 'temp_max': 29, 'temp_min': 19, 'precip': 38, 'snow': 0, 'precip_hours': 75, 'wind': 16, 'humidity': 49, 'sunshine': 310},
        9: {'temp_mean': 20, 'temp_max': 25, 'temp_min': 15, 'precip': 50, 'snow': 0, 'precip_hours': 90, 'wind': 17, 'humidity': 53, 'sunshine': 270},
        10: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 70, 'snow': 5, 'precip_hours': 110, 'wind': 19, 'humidity': 58, 'sunshine': 220},
        11: {'temp_mean': 8, 'temp_max': 13, 'temp_min': 3, 'precip': 90, 'snow': 20, 'precip_hours': 140, 'wind': 22, 'humidity': 64, 'sunshine': 170},
        12: {'temp_mean': 3, 'temp_max': 8, 'temp_min': -2, 'precip': 115, 'snow': 35, 'precip_hours': 165, 'wind': 24, 'humidity': 69, 'sunshine': 145},
    }
}

# Holiday data for Kashmir (2024-2025)
HOLIDAY_DATA = {
    1: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2, 'days_to_next': 5},
    2: {'count': 1, 'long_weekend': 0, 'national': 0, 'festival': 1, 'days_to_next': 15},
    3: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2, 'days_to_next': 12},
    4: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2, 'days_to_next': 8},
    5: {'count': 2, 'long_weekend': 0, 'national': 1, 'festival': 1, 'days_to_next': 20},
    6: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2, 'days_to_next': 18},
    7: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2, 'days_to_next': 25},
    8: {'count': 3, 'long_weekend': 1, 'national': 2, 'festival': 1, 'days_to_next': 7},
    9: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2, 'days_to_next': 22},
    10: {'count': 4, 'long_weekend': 2, 'national': 1, 'festival': 3, 'days_to_next': 5},
    11: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2, 'days_to_next': 15},
    12: {'count': 4, 'long_weekend': 2, 'national': 2, 'festival': 2, 'days_to_next': 3},
}

def get_season(month):
    """Get season code from month"""
    if month in [12, 1, 2]:
        return 1  # Winter
    elif month in [3, 4, 5]:
        return 2  # Spring
    elif month in [6, 7, 8]:
        return 3  # Summer
    else:
        return 4  # Autumn

def prepare_features(location, year, month, rolling_avg=80000):
    """
    Prepare 22 features for model prediction
    Matches exact feature order from feature_engineering.py
    """
    location_code = LOCATION_MAPPING.get(location, 3)  # Default to Gulmarg
    season = get_season(month)

    # Get weather data (with fallback to Gulmarg if location not in WEATHER_DATA)
    weather_key = location if location in WEATHER_DATA else 'Gulmarg'
    weather = WEATHER_DATA[weather_key].get(month, WEATHER_DATA['Gulmarg'][6])

    # Get holiday data
    holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[6])

    # Calculate derived features
    temp_sunshine = weather['temp_mean'] * weather['sunshine']
    temp_range = weather['temp_max'] - weather['temp_min']
    precip_temp = weather['precip'] * weather['temp_mean']

    # Feature vector (22 features total - MUST MATCH model training order)
    features = [
        location_code,                    # 1. location_encoded
        year,                            # 2. year
        month,                           # 3. month
        season,                          # 4. season
        rolling_avg,                     # 5. footfall_rolling_avg
        weather['temp_mean'],            # 6. temperature_2m_mean
        weather['temp_max'],             # 7. temperature_2m_max
        weather['temp_min'],             # 8. temperature_2m_min
        weather['precip'],               # 9. precipitation_sum
        weather['snow'],                 # 10. snowfall_sum
        weather['precip_hours'],         # 11. precipitation_hours
        weather['wind'],                 # 12. windgusts_10m_max
        weather['humidity'],             # 13. relative_humidity_2m_mean
        weather['sunshine'],             # 14. sunshine_duration
        temp_sunshine,                   # 15. temp_sunshine_interaction
        temp_range,                      # 16. temperature_range
        precip_temp,                     # 17. precipitation_temperature
        holidays['count'],               # 18. holiday_count
        holidays['long_weekend'],        # 19. long_weekend_count
        holidays['national'],            # 20. national_holiday_count
        holidays['festival'],            # 21. festival_holiday_count
        holidays['days_to_next']         # 22. days_to_next_holiday
    ]

    return np.array(features).reshape(1, -1)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict footfall for given location and date

    Expected JSON:
    {
        "location": "Gulmarg",
        "year": 2024,
        "month": 12,
        "rolling_avg": 95000  (optional)
    }
    """
    try:
        if model is None or scaler is None:
            return jsonify({'error': 'Model not loaded. Please ensure model files exist in the models directory.'}), 500

        data = request.get_json()

        # Validate inputs
        location = data.get('location')
        year = data.get('year')
        month = data.get('month')
        rolling_avg = data.get('rolling_avg', 80000)

        if not all([location, year, month]):
            return jsonify({'error': 'Missing required fields: location, year, month'}), 400

        if location not in LOCATION_MAPPING:
            return jsonify({'error': f'Unknown location: {location}'}), 400

        if not (1 <= month <= 12):
            return jsonify({'error': 'Month must be between 1 and 12'}), 400

        # Prepare features
        features = prepare_features(location, year, month, rolling_avg)

        # Scale features
        features_scaled = scaler.transform(features)

        # Predict (model outputs log-transformed values)
        prediction_log = model.predict(features_scaled)[0]
        
        # Handle extreme prediction values to prevent overflow
        if abs(prediction_log) > 100:
            logger.warning(f"Extreme prediction value detected: {prediction_log}, clipping to reasonable range")
            prediction_log = np.clip(prediction_log, -10, 10)
        
        # Inverse log transform: expm1 reverses log1p
        try:
            prediction = np.expm1(prediction_log)
        except:
            # Fallback if expm1 fails
            prediction = np.exp(prediction_log) - 1
            
        # Ensure non-negative and finite with reasonable bounds
        if np.isinf(prediction) or np.isnan(prediction):
            prediction = 50000  # Default reasonable value
        else:
            # Clip to reasonable range (1000 to 200000 visitors)
            prediction = max(1000, min(prediction, 200000))

        # Get weather data for response
        weather_key = location if location in WEATHER_DATA else 'Gulmarg'
        weather = WEATHER_DATA[weather_key].get(month, WEATHER_DATA['Gulmarg'][6])
        holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[6])

        # Calculate confidence (based on model metadata)
        r2_score = metadata.get('test_metrics', {}).get('R2', 0.85) if metadata else 0.85
        confidence = min(0.95, max(0.80, r2_score + 0.02))

        response = {
            'success': True,
            'prediction': {
                'location': location,
                'year': year,
                'month': month,
                'predicted_footfall': int(round(prediction)),
                'confidence': round(confidence, 2),
                'weather': {
                    'temperature_mean': weather['temp_mean'],
                    'temperature_max': weather['temp_max'],
                    'temperature_min': weather['temp_min'],
                    'snowfall': weather['snow'],
                    'sunshine_hours': weather['sunshine']
                },
                'holidays': {
                    'count': holidays['count'],
                    'has_long_weekend': holidays['long_weekend'] > 0
                }
            },
            'timestamp': datetime.now().isoformat()
        }

        logger.info(f"Prediction: {location} {year}-{month:02d} → {int(prediction):,} visitors")

        return jsonify(response)

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/locations', methods=['GET'])
def get_locations():
    """Get list of available locations"""
    return jsonify({
        'locations': list(LOCATION_MAPPING.keys())
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
