#!/usr/bin/env python3
"""
Comprehensive test of the Flask API with log-transformed model
"""

import requests
import json

def test_location_sensitivity():
    url = "http://localhost:5000/api/predict"
    
    # Test all locations for the same conditions (summer in June 2025)
    print("Location Sensitivity Test (June 2025):")
    print("=" * 50)
    
    predictions = {}
    
    locations = ['Aharbal', 'Doodpathri', 'Gulmarg', 'Gurez', 'Kokernag', 
                'Lolab', 'Manasbal', 'Pahalgam', 'Sonamarg', 'Yousmarg']
    
    for location_name in locations:
        test_data = {
            "location": location_name,
            "year": 2025,
            "month": 6
        }
        try:
            response = requests.post(url, json=test_data)
            if response.status_code == 200:
                result = response.json()
                prediction = result['prediction']
                footfall = prediction['predicted_footfall']
                predictions[location_name] = footfall
                print(f"{location_name:12}: {footfall:6,} visitors")
            else:
                print(f"{location_name:12}: Error - Status {response.status_code}")
        except Exception as e:
            print(f"{location_name:12}: Exception - {str(e)}")
    
    # Calculate range
    if predictions:
        values = list(predictions.values())
        prediction_range = max(values) - min(values)
        print(f"\nPrediction range: {prediction_range:,} visitors")
        
        if prediction_range > 1000:
            print("✅ Model shows good location sensitivity")
        else:
            print("⚠️ Model shows poor location sensitivity")
    
    print()

def test_seasonal_variations():
    url = "http://localhost:5000/api/predict"
    
    # Test seasonal variations for Gulmarg (winter sport destination)
    print("Seasonal Variations Test (Gulmarg):")
    print("=" * 50)
    
    seasonal_tests = [
        {"year": 2025, "month": 12, "season": "Winter"},
        {"year": 2025, "month": 6, "season": "Summer"},
        {"year": 2025, "month": 3, "season": "Spring"},
        {"year": 2025, "month": 9, "season": "Autumn"}
    ]
    
    for test in seasonal_tests:
        test_data = {
            "location": "Gulmarg",
            "year": test["year"],
            "month": test["month"]
        }
        
        try:
            response = requests.post(url, json=test_data)
            if response.status_code == 200:
                result = response.json()
                prediction = result['prediction']
                footfall = prediction['predicted_footfall']
                print(f"{test['season']:8}: {footfall:6,} visitors")
            else:
                print(f"{test['season']:8}: Error - Status {response.status_code}")
        except Exception as e:
            print(f"{test['season']:8}: Exception - {str(e)}")
    
    print()

def test_model_metadata():
    url = "http://localhost:5000/api/predict"
    
    test_data = {
        "location": "Gulmarg",
        "year": 2025,
        "month": 12
    }
    
    print("Model Metadata Verification:")
    print("=" * 50)
    
    try:
        response = requests.post(url, json=test_data)
        if response.status_code == 200:
            result = response.json()
            target_transform = result.get('target_transform', 'unknown')
            model_used = result.get('model_used', False)
            
            print(f"Model used: {model_used}")
            print(f"Target transform: {target_transform}")
            
            if target_transform == 'log':
                print("✅ Correctly using log-transformed model")
            else:
                print("⚠️ Not using log-transformed model")
        else:
            print(f"Error - Status {response.status_code}")
    except Exception as e:
        print(f"Exception - {str(e)}")
    
    print()

if __name__ == '__main__':
    test_model_metadata()
    test_location_sensitivity()
    test_seasonal_variations()