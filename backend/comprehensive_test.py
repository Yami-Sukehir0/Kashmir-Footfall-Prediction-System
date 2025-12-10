"""
Comprehensive test to replicate the exact issue described by the user
"""
import requests
import json

def test_identical_predictions():
    """
    Test the exact scenario mentioned by the user:
    - Two different destinations
    - January 2026
    - Checking if they return identical values of 58,894 visitors
    """
    url = "http://localhost:5000/api/predict"
    
    # Test the exact scenario: January 2026 for different destinations
    locations_to_test = ["Gulmarg", "Pahalgam", "Sonamarg", "Aharbal"]
    
    print("=== Testing January 2026 Predictions ===")
    results = {}
    
    for location in locations_to_test:
        test_data = {
            "location": location,
            "year": 2026,
            "month": 1
        }
        
        print(f"\nTesting {location} for January 2026...")
        try:
            response = requests.post(url, json=test_data)
            if response.status_code == 200:
                data = response.json()
                footfall = data['prediction']['predicted_footfall']
                model_used = data.get('model_used', False)
                confidence = data['prediction']['confidence']
                
                results[location] = {
                    'footfall': footfall,
                    'model_used': model_used,
                    'confidence': confidence
                }
                
                print(f"  Success: {data['success']}")
                print(f"  Model used: {model_used}")
                print(f"  Predicted footfall: {footfall:,}")
                print(f"  Confidence: {confidence}")
            else:
                print(f"  Error: {response.status_code}")
                print(f"  Response: {response.text}")
        except Exception as e:
            print(f"  Request failed: {e}")
    
    # Check if all predictions are identical
    print("\n=== Analysis ===")
    footfalls = [result['footfall'] for result in results.values()]
    all_identical = len(set(footfalls)) == 1
    
    if all_identical:
        print(f"⚠️  ALL PREDICTIONS ARE IDENTICAL: {footfalls[0]:,} visitors")
    else:
        print("✅ Predictions are different for different locations:")
        for location, result in results.items():
            print(f"  {location}: {result['footfall']:,} visitors (Model used: {result['model_used']})")
    
    # Check if model is being used
    models_used = [result['model_used'] for result in results.values()]
    all_using_model = all(models_used)
    
    if all_using_model:
        print("✅ All predictions are using the trained model")
    else:
        print("⚠️  Some predictions are using fallback algorithm")
        for location, result in results.items():
            print(f"  {location}: Model used = {result['model_used']}")
    
    return results

def test_with_rolling_average():
    """
    Test with rolling average to see if that affects the predictions
    """
    url = "http://localhost:5000/api/predict"
    
    print("\n\n=== Testing with Rolling Average ===")
    
    test_cases = [
        {
            "location": "Gulmarg",
            "year": 2026,
            "month": 1,
            "rolling_avg": 95000
        },
        {
            "location": "Pahalgam",
            "year": 2026,
            "month": 1,
            "rolling_avg": 95000
        }
    ]
    
    for case in test_cases:
        location = case["location"]
        print(f"\nTesting {location} with rolling average of 95,000...")
        try:
            response = requests.post(url, json=case)
            if response.status_code == 200:
                data = response.json()
                footfall = data['prediction']['predicted_footfall']
                model_used = data.get('model_used', False)
                
                print(f"  Success: {data['success']}")
                print(f"  Model used: {model_used}")
                print(f"  Predicted footfall: {footfall:,}")
            else:
                print(f"  Error: {response.status_code}")
        except Exception as e:
            print(f"  Request failed: {e}")

if __name__ == "__main__":
    print("Comprehensive Test for Kashmir Tourism Prediction System")
    print("=" * 60)
    
    # Test the main issue
    results = test_identical_predictions()
    
    # Test with rolling average
    test_with_rolling_average()
    
    print("\n" + "=" * 60)
    print("Test completed.")