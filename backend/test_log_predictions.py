#!/usr/bin/env python3
"""
Test log-transformed model predictions
"""

import joblib
import numpy as np
import os

def prepare_features(location, year, month, rolling_avg=80000):
    """
    Prepare 17 features for model prediction (copied from app.py)
    """
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
    
    # Weather data (simplified for testing)
    WEATHER_DATA = {
        'Gulmarg': {
            12: {'temp_mean': -1, 'temp_max': 4, 'temp_min': -6, 'precip': 140, 'snow': 70, 'precip_hours': 190, 'wind': 34, 'humidity': 74, 'sunshine': 130},
            6: {'temp_mean': 20, 'temp_max': 25, 'temp_min': 15, 'precip': 60, 'snow': 0, 'precip_hours': 100, 'wind': 22, 'humidity': 55, 'sunshine': 280},
        },
        'Pahalgam': {
            12: {'temp_mean': 3, 'temp_max': 8, 'temp_min': -2, 'precip': 115, 'snow': 35, 'precip_hours': 165, 'wind': 24, 'humidity': 69, 'sunshine': 145},
            6: {'temp_mean': 23, 'temp_max': 28, 'temp_min': 18, 'precip': 40, 'snow': 0, 'precip_hours': 80, 'wind': 16, 'humidity': 50, 'sunshine': 300},
        }
    }
    
    # Holiday data
    HOLIDAY_DATA = {
        12: {'count': 4, 'long_weekend': 2, 'national': 2, 'festival': 2, 'days_to_next': 3},
        6: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2, 'days_to_next': 18},
    }
    
    location_code = LOCATION_MAPPING.get(location, 3)  # Default to Gulmarg
    season = get_season(month)
    
    # Get weather data
    weather_key = location if location in WEATHER_DATA else 'Gulmarg'
    default_weather = {
        'temp_mean': 10, 'temp_max': 15, 'temp_min': 5, 'precip': 75, 
        'snow': 10, 'precip_hours': 120, 'wind': 20, 'humidity': 65, 'sunshine': 200
    }
    weather = WEATHER_DATA[weather_key].get(month, WEATHER_DATA['Gulmarg'].get(6, default_weather))
    
    # Get holiday data
    holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[6])
    
    # Calculate derived features
    temp_sunshine = weather['temp_mean'] * weather['sunshine']
    temp_range = weather['temp_max'] - weather['temp_min']
    precip_temp = weather['precip'] * weather['temp_mean']
    
    # Feature vector (17 features total)
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

def main():
    print("Testing log-transformed model predictions...")
    
    # Load model, scaler, and metadata
    MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
    SCALER_PATH = os.path.join('models', 'scaler.pkl')
    METADATA_PATH = os.path.join('models', 'best_model', 'metadata.pkl')
    
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    metadata = joblib.load(METADATA_PATH)
    
    target_transform = metadata.get('target_transform', 'linear')
    print(f"Model trained with {target_transform} target transformation")
    
    # Test predictions for different locations
    test_cases = [
        ('Gulmarg', 2025, 12),  # Winter in Gulmarg (should be popular for skiing)
        ('Gulmarg', 2025, 6),   # Summer in Gulmarg (should be less popular)
        ('Pahalgam', 2025, 12), # Winter in Pahalgam
        ('Pahalgam', 2025, 6),  # Summer in Pahalgam (should be popular)
    ]
    
    print("\nPredictions:")
    print("-" * 60)
    
    for location, year, month in test_cases:
        # Prepare features
        features = prepare_features(location, year, month)
        
        # Scale features
        scaled_features = scaler.transform(features)
        
        # Make prediction (log-transformed value)
        model_prediction = model.predict(scaled_features)[0]
        
        # Apply inverse transformation if model was trained on log-transformed data
        if target_transform == 'log':
            # Apply exponential to convert back from log scale
            prediction_value = np.exp(model_prediction)
            print(f"{location:10} {year}-{month:02d}: {model_prediction:.4f} (log) -> {prediction_value:,.0f} (actual)")
        else:
            # Direct use of prediction for linear scale models
            prediction_value = model_prediction
            print(f"{location:10} {year}-{month:02d}: {model_prediction:,.0f} (linear)")
    
    print("\nLocation sensitivity test:")
    print("-" * 60)
    
    # Test multiple locations for the same conditions
    base_year, base_month = 2025, 6
    predictions = {}
    
    for location in ['Aharbal', 'Doodpathri', 'Gulmarg', 'Gurez', 'Kokernag', 'Lolab', 'Manasbal', 'Pahalgam', 'Sonamarg', 'Yousmarg']:
        features = prepare_features(location, base_year, base_month)
        scaled_features = scaler.transform(features)
        model_prediction = model.predict(scaled_features)[0]
        
        if target_transform == 'log':
            prediction_value = np.exp(model_prediction)
        else:
            prediction_value = model_prediction
            
        predictions[location] = prediction_value
        print(f"{location:10}: {prediction_value:,.0f} visitors")
    
    # Calculate range of predictions
    values = list(predictions.values())
    prediction_range = max(values) - min(values)
    print(f"\nPrediction range across locations: {prediction_range:,.0f} visitors")
    
    if prediction_range > 1000:
        print("✅ Model shows good location sensitivity")
    else:
        print("⚠️ Model shows poor location sensitivity")

if __name__ == '__main__':
    main()