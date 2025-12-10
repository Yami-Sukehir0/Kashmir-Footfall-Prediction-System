#!/usr/bin/env python3
"""
Test script to verify that the prediction system is working correctly
This script tests the prepare_features function and model loading
"""

import sys
import os
import json

# Add the current directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_prepare_features():
    """Test the prepare_features function with different locations"""
    try:
        from app import prepare_features, LOCATION_MAPPING
        
        print("Testing prepare_features function...")
        print("=" * 50)
        
        # Test different locations and months
        test_cases = [
            ('Gulmarg', 2024, 12, 80000),    # Winter ski season
            ('Pahalgam', 2024, 6, 80000),    # Summer peak season
            ('Sonamarg', 2024, 9, 80000),    # Autumn season
            ('Aharbal', 2024, 3, 80000),     # Spring season
        ]
        
        for location, year, month, rolling_avg in test_cases:
            print(f"\nTesting: {location} in {month}/{year}")
            try:
                features = prepare_features(location, year, month, rolling_avg)
                print(f"  Features shape: {features.shape}")
                print(f"  Features array: {features}")
                print(f"  ✅ Success")
            except Exception as e:
                print(f"  ❌ Error: {e}")
                
    except ImportError as e:
        print(f"Could not import app module: {e}")
    except Exception as e:
        print(f"Error testing prepare_features: {e}")

def test_model_loading():
    """Test that model files can be loaded"""
    try:
        from app import MODEL_PATH, SCALER_PATH, METADATA_PATH
        import joblib
        
        print("\n\nTesting model loading...")
        print("=" * 50)
        
        # Check if files exist
        files = {
            'Model': MODEL_PATH,
            'Scaler': SCALER_PATH,
            'Metadata': METADATA_PATH
        }
        
        for name, path in files.items():
            print(f"\nChecking {name}...")
            if os.path.exists(path):
                try:
                    obj = joblib.load(path)
                    size = os.path.getsize(path)
                    print(f"  ✅ {name} loaded successfully ({size} bytes)")
                    
                    # Check features for model and scaler
                    if name in ['Model', 'Scaler'] and hasattr(obj, 'n_features_in_'):
                        features = obj.n_features_in_
                        print(f"  🎯 {name} expects {features} features")
                        if features == 17:
                            print(f"  ✅ Feature count correct!")
                        else:
                            print(f"  ⚠️  Feature count unexpected: {features}")
                            
                except Exception as e:
                    print(f"  ❌ Error loading {name}: {e}")
            else:
                print(f"  ❌ {name} not found at {path}")
                
    except ImportError as e:
        print(f"Could not import app module: {e}")
    except Exception as e:
        print(f"Error testing model loading: {e}")

def test_weather_data():
    """Test that weather data is properly structured"""
    try:
        from app import WEATHER_DATA, LOCATION_MAPPING
        
        print("\n\nTesting weather data...")
        print("=" * 50)
        
        print(f"Number of locations with weather data: {len(WEATHER_DATA)}")
        print(f"Expected locations: {len(LOCATION_MAPPING)}")
        
        if len(WEATHER_DATA) >= len(LOCATION_MAPPING):
            print("✅ All locations have weather data")
        else:
            print("⚠️  Some locations may be missing weather data")
            
        # Check a few locations
        for location in ['Gulmarg', 'Pahalgam', 'Aharbal']:
            if location in WEATHER_DATA:
                months = len(WEATHER_DATA[location])
                print(f"  {location}: {months} months of data")
            else:
                print(f"  {location}: ❌ Missing")
                
    except ImportError as e:
        print(f"Could not import app module: {e}")
    except Exception as e:
        print(f"Error testing weather data: {e}")

if __name__ == "__main__":
    print("KASHMIR TOURISM PREDICTION SYSTEM - VERIFICATION TEST")
    print("=" * 60)
    
    test_weather_data()
    test_prepare_features()
    test_model_loading()
    
    print("\n\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)