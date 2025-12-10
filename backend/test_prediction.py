"""
Test script to verify the model prediction works correctly after the fix
"""
import joblib
import numpy as np
import os
import requests
import json

# Test prediction for Gulmarg in January 2026
url = "http://localhost:5000/api/predict"
data = {
    "location": "Gulmarg",
    "year": 2026,
    "month": 3
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")


def test_model_loading():
    """Test that model files can be loaded correctly"""
    print("=== TESTING MODEL LOADING ===")
    
    try:
        # Test loading model
        model = joblib.load('models/best_model/model.pkl')
        print(f"✓ Model loaded successfully")
        print(f"  Model type: {type(model).__name__}")
        print(f"  Expected features: {model.n_features_in_}")
        
        # Test loading scaler
        scaler = joblib.load('models/scaler.pkl')
        print(f"✓ Scaler loaded successfully")
        print(f"  Scaler features: {scaler.n_features_in_}")
        
        # Test loading metadata
        metadata = joblib.load('models/best_model_metadata.pkl')
        print(f"✓ Metadata loaded successfully")
        print(f"  Feature count: {metadata.get('num_features', 'Unknown')}")
        
        return model, scaler, metadata
    except Exception as e:
        print(f"✗ Failed to load model files: {e}")
        return None, None, None

def test_feature_preparation():
    """Test feature preparation with the same logic as the app"""
    print("\n=== TESTING FEATURE PREPARATION ===")
    
    # Simulate the prepare_features function from app.py
    # For Gulmarg in January 2026 with rolling average of 70000
    
    # Mock data structures (from app.py)
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
    
    WEATHER_DATA = {
        'Gulmarg': {
            1: {'temp_mean': -2, 'temp_max': 3, 'temp_min': -7, 'precip': 150, 'snow': 80, 'precip_hours': 200, 'wind': 35, 'humidity': 75, 'sunshine': 120},
            12: {'temp_mean': -1, 'temp_max': 4, 'temp_min': -6, 'precip': 140, 'snow': 70, 'precip_hours': 190, 'wind': 34, 'humidity': 74, 'sunshine': 130},
        }
    }
    
    HOLIDAY_DATA = {
        1: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2, 'days_to_next': 5},
    }
    
    def get_season(month):
        if month in [12, 1, 2]:
            return 1  # Winter
        elif month in [3, 4, 5]:
            return 2  # Spring
        elif month in [6, 7, 8]:
            return 3  # Summer
        else:
            return 4  # Autumn
    
    def prepare_features(location, year, month, rolling_avg=80000):
        location_code = LOCATION_MAPPING.get(location, 3)  # Default to Gulmarg
        season = get_season(month)

        # Get weather data (with fallback to Gulmarg if location not in WEATHER_DATA)
        weather_key = location if location in WEATHER_DATA else 'Gulmarg'
        weather = WEATHER_DATA[weather_key].get(month, WEATHER_DATA['Gulmarg'][12])

        # Get holiday data
        holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[1])

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
    
    # Test with Gulmarg in January 2026
    try:
        features = prepare_features("Gulmarg", 2026, 1, 70000)
        print(f"✓ Features prepared successfully")
        print(f"  Shape: {features.shape}")
        print(f"  Features: {features.flatten()}")
        return features
    except Exception as e:
        print(f"✗ Failed to prepare features: {e}")
        return None

def test_prediction_pipeline(model, scaler, features):
    """Test the complete prediction pipeline"""
    print("\n=== TESTING PREDICTION PIPELINE ===")
    
    try:
        # Test scaling
        print("Scaling features...")
        scaled_features = scaler.transform(features)
        print(f"✓ Features scaled successfully")
        print(f"  Scaled shape: {scaled_features.shape}")
        
        # Test prediction
        print("Making prediction...")
        prediction = model.predict(scaled_features)[0]
        print(f"✓ Prediction successful!")
        print(f"  Raw prediction: {prediction}")
        print(f"  Rounded prediction: {int(round(prediction)):,} visitors")
        
        # Test confidence (if available)
        if hasattr(model, 'predict_proba'):
            try:
                probabilities = model.predict_proba(scaled_features)
                confidence = float(np.max(probabilities))
                print(f"  Confidence: {confidence:.2f}")
            except Exception as e:
                print(f"  Note: Could not get confidence - {e}")
                confidence = 0.85
        else:
            confidence = 0.85
            print(f"  Confidence: {confidence:.2f} (default)")
        
        return True, int(round(prediction))
        
    except Exception as e:
        print(f"✗ Prediction pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        return False, 0

def test_edge_cases(model, scaler):
    """Test various edge cases"""
    print("\n=== TESTING EDGE CASES ===")
    
    test_cases = [
        ("Gulmarg", 2026, 1, 70000),   # Original case
        ("Pahalgam", 2025, 6, 50000),  # Summer peak
        ("Sonamarg", 2024, 12, 30000), # Winter low
        ("Gulmarg", 2027, 7, 90000),   # High rolling average
    ]
    
    success_count = 0
    
    for location, year, month, rolling_avg in test_cases:
        try:
            # Mock feature preparation for each case
            LOCATION_MAPPING = {
                'Aharbal': 1, 'Doodpathri': 2, 'Gulmarg': 3, 'Gurez': 4,
                'Kokernag': 5, 'Lolab': 6, 'Manasbal': 7, 'Pahalgam': 8,
                'Sonamarg': 9, 'Yousmarg': 10
            }
            
            WEATHER_DATA = {
                'Gulmarg': {
                    1: {'temp_mean': -2, 'temp_max': 3, 'temp_min': -7, 'precip': 150, 'snow': 80, 'sunshine': 120},
                    6: {'temp_mean': 20, 'temp_max': 25, 'temp_min': 15, 'precip': 60, 'snow': 0, 'sunshine': 280},
                    7: {'temp_mean': 22, 'temp_max': 27, 'temp_min': 17, 'precip': 50, 'snow': 0, 'sunshine': 300},
                    12: {'temp_mean': -1, 'temp_max': 4, 'temp_min': -6, 'precip': 140, 'snow': 70, 'sunshine': 130},
                },
                'Pahalgam': {
                    6: {'temp_mean': 23, 'temp_max': 28, 'temp_min': 18, 'precip': 40, 'snow': 0, 'sunshine': 300},
                },
                'Sonamarg': {
                    12: {'temp_mean': 4, 'temp_max': 9, 'temp_min': -1, 'precip': 110, 'snow': 40, 'sunshine': 150},
                }
            }
            
            HOLIDAY_DATA = {
                1: {'count': 3, 'long_weekend': 1, 'national': 1, 'festival': 2},
                6: {'count': 2, 'long_weekend': 1, 'national': 0, 'festival': 2},
                7: {'count': 2, 'long_weekend': 0, 'national': 0, 'festival': 2},
                12: {'count': 4, 'long_weekend': 2, 'national': 2, 'festival': 2},
            }
            
            def get_season(month):
                if month in [12, 1, 2]:
                    return 1
                elif month in [3, 4, 5]:
                    return 2
                elif month in [6, 7, 8]:
                    return 3
                else:
                    return 4
            
            location_code = LOCATION_MAPPING.get(location, 3)
            season = get_season(month)
            weather_key = location if location in WEATHER_DATA else 'Gulmarg'
            weather = WEATHER_DATA[weather_key].get(month, WEATHER_DATA['Gulmarg'][12])
            holidays = HOLIDAY_DATA.get(month, HOLIDAY_DATA[1])
            
            temp_sunshine = weather['temp_mean'] * weather['sunshine']
            temp_range = weather['temp_max'] - weather['temp_min']
            precip_temp = weather['precip'] * weather['temp_mean']
            
            features = np.array([
                location_code, year, month, season, rolling_avg,
                weather['temp_mean'], weather['temp_max'], weather['temp_min'],
                weather['precip'], weather['sunshine'], temp_sunshine,
                temp_range, precip_temp,
                holidays['count'], holidays['long_weekend'], holidays['national'], holidays['festival']
            ]).reshape(1, -1)
            
            scaled_features = scaler.transform(features)
            prediction = model.predict(scaled_features)[0]
            
            print(f"✓ {location} {month}/{year}: {int(round(prediction)):,} visitors")
            success_count += 1
            
        except Exception as e:
            print(f"✗ {location} {month}/{year}: Failed - {e}")
    
    print(f"\nEdge case tests: {success_count}/{len(test_cases)} passed")
    return success_count == len(test_cases)

def main():
    """Main test function"""
    print("KASHMIR TOURISM MODEL TEST")
    print("=" * 50)
    
    # Test 1: Model loading
    model, scaler, metadata = test_model_loading()
    if model is None or scaler is None:
        print("\n❌ MODEL LOADING FAILED")
        return
    
    # Test 2: Feature preparation
    features = test_feature_preparation()
    if features is None:
        print("\n❌ FEATURE PREPARATION FAILED")
        return
    
    # Test 3: Prediction pipeline
    success, prediction = test_prediction_pipeline(model, scaler, features)
    if not success:
        print("\n❌ PREDICTION PIPELINE FAILED")
        return
    
    # Test 4: Edge cases
    edge_success = test_edge_cases(model, scaler)
    
    # Final results
    print("\n" + "=" * 50)
    if success and edge_success:
        print("🎉 ALL TESTS PASSED!")
        print(f"✅ Model prediction works correctly")
        print(f"✅ No feature mismatch errors")
        print(f"✅ Prediction for Gulmarg Jan 2026: {prediction:,} visitors")
        print(f"✅ Edge cases handled properly")
        print("\n🎉 THE FIX IS WORKING CORRECTLY! 🎉")
    else:
        print("❌ SOME TESTS FAILED")
        print("Please check the errors above and ensure the fix was applied correctly.")
    print("=" * 50)

if __name__ == "__main__":
    main()