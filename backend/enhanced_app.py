#!/usr/bin/env python3
"""
Enhanced Kashmir Tourism Prediction API with Dynamic Weather Analysis
"""

import numpy as np
import pandas as pd
import joblib
import os
import logging
from flask import Flask, request, jsonify
from datetime import datetime
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Global variables for model, scaler, and metadata
model = None
scaler = None
metadata = None

# Location mapping (alphabetical order)
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

# Load temporal weather patterns if available
TEMPORAL_WEATHER_PATTERNS = {}
try:
    with open('temporal_weather_patterns.json', 'r') as f:
        TEMPORAL_WEATHER_PATTERNS = json.load(f)
    logger.info("Loaded temporal weather patterns for dynamic weather analysis")
except FileNotFoundError:
    logger.warning("Temporal weather patterns not found, using static weather data")
except Exception as e:
    logger.error(f"Error loading temporal weather patterns: {str(e)}")

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

def get_static_weather_data(location, month):
    """Get static weather data (fallback approach)"""
    # Weather data for Kashmir (2024-2025) - Typical values by location and month
    WEATHER_DATA = {
        # Gulmarg (ski resort - cold climate)
        'Gulmarg': {
            1: {'temp_mean': -2, 'temp_max': 3, 'temp_min': -7, 'precip': 150, 'snow': 80, 'precip_hours': 200, 'wind': 35, 'humidity': 75, 'sunshine': 120},
            2: {'temp_mean': 0, 'temp_max': 5, 'temp_min': -5, 'precip': 140, 'snow': 75, 'precip_hours': 180, 'wind': 33, 'humidity': 73, 'sunshine': 140},
            3: {'temp_mean': 5, 'temp_max': 10, 'temp_min': 0, 'precip': 120, 'snow': 40, 'precip_hours': 160, 'wind': 30, 'humidity': 70, 'sunshine': 160},
            4: {'temp_mean': 10, 'temp_max': 15, 'temp_min': 5, 'precip': 100, 'snow': 10, 'precip_hours': 140, 'wind': 27, 'humidity': 67, 'sunshine': 180},
            5: {'temp_mean': 15, 'temp_max': 20, 'temp_min': 10, 'precip': 80, 'snow': 2, 'precip_hours': 120, 'wind': 24, 'humidity': 64, 'sunshine': 200},
            6: {'temp_mean': 17, 'temp_max': 22, 'temp_min': 12, 'precip': 45, 'snow': 0, 'precip_hours': 100, 'wind': 22, 'humidity': 62, 'sunshine': 220},
            7: {'temp_mean': 19, 'temp_max': 24, 'temp_min': 14, 'precip': 50, 'snow': 0, 'precip_hours': 105, 'wind': 20, 'humidity': 60, 'sunshine': 230},
            8: {'temp_mean': 18, 'temp_max': 23, 'temp_min': 13, 'precip': 55, 'snow': 0, 'precip_hours': 110, 'wind': 21, 'humidity': 61, 'sunshine': 225},
            9: {'temp_mean': 14, 'temp_max': 19, 'temp_min': 9, 'precip': 70, 'snow': 5, 'precip_hours': 125, 'wind': 24, 'humidity': 65, 'sunshine': 205},
            10: {'temp_mean': 8, 'temp_max': 13, 'temp_min': 3, 'precip': 90, 'snow': 15, 'precip_hours': 145, 'wind': 28, 'humidity': 69, 'sunshine': 185},
            11: {'temp_mean': 2, 'temp_max': 7, 'temp_min': -3, 'precip': 110, 'snow': 45, 'precip_hours': 170, 'wind': 32, 'humidity': 73, 'sunshine': 155},
            12: {'temp_mean': 2, 'temp_max': 7, 'temp_min': -3, 'precip': 120, 'snow': 50, 'precip_hours': 185, 'wind': 25, 'humidity': 72, 'sunshine': 135},
        }
    }
    
    # Default to Gulmarg if location not found
    location_weather = WEATHER_DATA.get(location, WEATHER_DATA['Gulmarg'])
    return location_weather.get(month, location_weather.get(6, {}))  # Fallback to June data

def get_dynamic_weather_data(location, year, month):
    """
    Get dynamic weather data based on temporal patterns analysis
    
    Args:
        location (str): Location name
        year (int): Target year
        month (int): Target month
    
    Returns:
        dict: Weather data with dynamic adjustments
    """
    # If we have temporal patterns, use them
    if TEMPORAL_WEATHER_PATTERNS and location in TEMPORAL_WEATHER_PATTERNS:
        location_patterns = TEMPORAL_WEATHER_PATTERNS[location]
        if str(month) in location_patterns:  # JSON keys are strings
            pattern = location_patterns[str(month)]
            
            # Calculate year-based adjustments
            base_year = 2020  # Reference year for trends
            year_diff = year - base_year
            
            # Apply trends
            temp_mean = pattern['temp_mean'] + (pattern['temp_trend'] * year_diff)
            precipitation = pattern['precipitation_sum'] + (pattern['precip_trend'] * year_diff)
            
            # Ensure realistic bounds
            temp_mean = max(-20, min(40, temp_mean))
            precipitation = max(0, precipitation)
            
            # Return enhanced weather data
            return {
                'temp_mean': temp_mean,
                'temp_max': temp_mean + 5,  # Approximate max temp
                'temp_min': temp_mean - 5,   # Approximate min temp
                'precip': precipitation,
                'snow': 0 if temp_mean > 2 else max(0, 30 - temp_mean * 2),  # Snow based on temperature
                'precip_hours': precipitation * 1.5,  # Approximate precipitation hours
                'wind': 25,  # Average wind speed
                'humidity': 65,  # Average humidity
                'sunshine': pattern['sunshine_duration'],
                'temp_trend': pattern['temp_trend'],
                'precip_trend': pattern['precip_trend'],
                'sample_size': pattern['sample_size']
            }
    
    # Fallback to static data if no temporal patterns available
    return get_static_weather_data(location, month)

def prepare_features(location, year, month, rolling_avg=80000, use_dynamic_weather=True):
    """
    Prepare 17 features for model prediction with option for dynamic weather
    
    Args:
        location (str): Location name
        year (int): Year for prediction
        month (int): Month for prediction
        rolling_avg (float): Rolling average footfall
        use_dynamic_weather (bool): Whether to use dynamic weather analysis
    
    Returns:
        np.array: Feature array for model prediction
    """
    location_code = LOCATION_MAPPING.get(location, 3)  # Default to Gulmarg
    season = get_season(month)

    # Get weather data - dynamic or static
    if use_dynamic_weather:
        weather = get_dynamic_weather_data(location, year, month)
        logger.info(f"Using dynamic weather for {location} {year}-{month:02d}")
    else:
        weather = get_static_weather_data(location, month)
        logger.info(f"Using static weather for {location} {year}-{month:02d}")

    # Holiday data (static)
    HOLIDAY_DATA = {
        1: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
        2: {'count': 1, 'long_weekend': 0, 'national': 0, 'festival': 1},
        3: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
        4: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
        5: {'count': 2, 'long_weekend': 0, 'national': 1, 'festival': 1},
        6: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
        7: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
        8: {'count': 3, 'long_weekend': 1, 'national': 2, 'festival': 1},
        9: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
        10: {'count': 4, 'long_weekend': 2, 'national': 1, 'festival': 3},
        11: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
        12: {'count': 4, 'long_weekend': 2, 'national': 2, 'festival': 2},
    }
    
    holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[6])

    # Calculate derived features
    temp_sunshine = weather['temp_mean'] * weather['sunshine']
    temp_range = weather['temp_max'] - weather['temp_min']
    precip_temp = weather['precip'] * weather['temp_mean']

    # Feature vector (17 features total - matching what the model expects)
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
        weather['sunshine'],             # 10. sunshine_duration
        temp_sunshine,                   # 11. temp_sunshine_interaction
        temp_range,                      # 12. temperature_range
        precip_temp,                     # 13. precipitation_temperature
        holidays['count'],               # 14. holiday_count
        holidays['long_weekend'],        # 15. long_weekend_count
        holidays['national'],            # 16. national_holiday_count
        holidays['festival']             # 17. festival_holiday_count
    ]

    return np.array(features).reshape(1, -1)

@app.route('/api/predict_dynamic', methods=['POST'])
def predict_with_dynamic_weather():
    """
    Enhanced prediction endpoint that uses dynamic weather analysis
    
    Expected JSON:
    {
        "location": "Gulmarg",
        "year": 2025,
        "month": 1,
        "rolling_avg": 80000,
        "use_dynamic_weather": true
    }
    """
    try:
        data = request.get_json()

        # Validate inputs
        location = data.get('location')
        year = data.get('year')
        month = data.get('month')
        rolling_avg = data.get('rolling_avg', 80000)
        use_dynamic_weather = data.get('use_dynamic_weather', True)

        if not all([location, year, month]):
            return jsonify({'error': 'Missing required fields: location, year, month'}), 400

        if location not in LOCATION_MAPPING:
            return jsonify({'error': f'Unknown location: {location}'}), 400

        if not (2015 <= year <= 2030):
            return jsonify({'error': 'Year must be between 2015 and 2030'}), 400

        if not (1 <= month <= 12):
            return jsonify({'error': 'Month must be between 1 and 12'}), 400

        # Use the actual trained ML model for prediction if available
        if model is not None and scaler is not None:
            # Prepare features with dynamic weather analysis
            features = prepare_features(location, year, month, rolling_avg, use_dynamic_weather)
            
            # Scale features
            scaled_features = scaler.transform(features)
            
            # Make prediction using the trained model
            model_prediction = model.predict(scaled_features)[0]
            
            # Get prediction confidence/probability if available
            confidence = 0.85  # Default confidence
            if hasattr(model, 'predict_proba'):
                try:
                    probabilities = model.predict_proba(scaled_features)
                    confidence = float(np.max(probabilities))
                except:
                    pass
            
            # Convert to integer and ensure reasonable bounds
            prediction = int(round(max(0, model_prediction)))
            
            # Get weather data for response
            if use_dynamic_weather:
                weather_data = get_dynamic_weather_data(location, year, month)
                weather_type = "Dynamic"
            else:
                weather_data = get_static_weather_data(location, month)
                weather_type = "Static"
            
            # Holiday data
            HOLIDAY_DATA = {
                1: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
                2: {'count': 1, 'long_weekend': 0, 'national': 0, 'festival': 1},
                3: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
                4: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
                5: {'count': 2, 'long_weekend': 0, 'national': 1, 'festival': 1},
                6: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
                7: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
                8: {'count': 3, 'long_weekend': 1, 'national': 2, 'festival': 1},
                9: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
                10: {'count': 4, 'long_weekend': 2, 'national': 1, 'festival': 3},
                11: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
                12: {'count': 4, 'long_weekend': 2, 'national': 2, 'festival': 2},
            }
            
            holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[6])
            
            response = {
                'success': True,
                'prediction': {
                    'location': location,
                    'year': year,
                    'month': month,
                    'predicted_footfall': prediction,
                    'confidence': round(confidence, 2),
                    'weather_approach': weather_type,
                    'weather': {
                        'temperature_mean': weather_data.get('temp_mean', 15),
                        'temperature_max': weather_data.get('temp_max', 20),
                        'temperature_min': weather_data.get('temp_min', 10),
                        'precipitation': weather_data.get('precip', 50),
                        'snowfall': weather_data.get('snow', 0),
                        'sunshine_hours': weather_data.get('sunshine', 200),
                        'wind_speed': weather_data.get('wind', 20),
                        'temp_trend': weather_data.get('temp_trend', 0) if use_dynamic_weather else 0,
                        'precip_trend': weather_data.get('precip_trend', 0) if use_dynamic_weather else 0,
                        'sample_size': weather_data.get('sample_size', 0) if use_dynamic_weather else 0
                    },
                    'holidays': {
                        'count': holidays['count'],
                        'long_weekends': holidays['long_weekend'],
                        'national_holidays': holidays['national'],
                        'festival_holidays': holidays['festival']
                    }
                },
                'timestamp': datetime.now().isoformat(),
                'model_used': True
            }

            logger.info(f"Enhanced Prediction: {location} {year}-{month:02d} → {prediction:,} visitors "
                       f"(Weather: {weather_type}, Confidence: {confidence:.2f})")

            return jsonify(response)
        
        else:
            return jsonify({'error': 'Model not available'}), 500
            
    except Exception as e:
        logger.error(f"Error in dynamic prediction: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/weather_analysis', methods=['POST'])
def weather_analysis():
    """
    Endpoint to analyze weather differences between static and dynamic approaches
    
    Expected JSON:
    {
        "location": "Gulmarg",
        "year": 2025,
        "month": 1
    }
    """
    try:
        data = request.get_json()
        location = data.get('location')
        year = data.get('year')
        month = data.get('month')
        
        if not all([location, year, month]):
            return jsonify({'error': 'Missing required fields: location, year, month'}), 400
            
        # Get static weather
        static_weather = get_static_weather_data(location, month)
        
        # Get dynamic weather
        dynamic_weather = get_dynamic_weather_data(location, year, month)
        
        # Calculate differences
        temp_diff = dynamic_weather.get('temp_mean', 15) - static_weather.get('temp_mean', 15)
        precip_diff = dynamic_weather.get('precip', 50) - static_weather.get('precip', 50)
        
        response = {
            'location': location,
            'year': year,
            'month': month,
            'static_weather': static_weather,
            'dynamic_weather': dynamic_weather,
            'differences': {
                'temperature_difference': round(temp_diff, 2),
                'precipitation_difference': round(precip_diff, 2),
                'temperature_percentage_change': round((temp_diff / static_weather.get('temp_mean', 15)) * 100, 2) if static_weather.get('temp_mean', 15) != 0 else 0,
                'precipitation_percentage_change': round((precip_diff / static_weather.get('precip', 50)) * 100, 2) if static_weather.get('precip', 50) != 0 else 0
            },
            'recommendation': 'Use dynamic weather' if abs(temp_diff) > 2 or abs(precip_diff) > 10 else 'Static weather sufficient'
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in weather analysis: {str(e)}")
        return jsonify({'error': f'Weather analysis failed: {str(e)}'}), 500

# Health check and other endpoints would go here...

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)