#!/usr/bin/env python3
"""
Test the API with the newly retrained model
"""

import requests
import json
import time

def test_api_predictions():
    """Test API predictions with the new model"""
    print("Testing API predictions with newly retrained model...")
    
    # Start the Flask app in a separate process
    print("Starting Flask server...")
    
    # Since we can't easily start the server from here, let's test by making direct calls
    # assuming the server is already running
    
    url = "http://localhost:5000/api/predict"
    
    # Test the exact scenario from the user's complaint
    test_cases = [
        {
            "location": "Gulmarg",
            "year": 2026,
            "month": 1
        },
        {
            "location": "Pahalgam",
            "year": 2026,
            "month": 1
        },
        {
            "location": "Sonamarg",
            "year": 2026,
            "month": 1
        },
        {
            "location": "Aharbal",
            "year": 2026,
            "month": 1
        }
    ]
    
    print("\n=== API Prediction Test ===")
    
    predictions = {}
    
    for case in test_cases:
        location = case["location"]
        print(f"\nTesting {location} for January 2026...")
        
        try:
            response = requests.post(url, json=case, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                footfall = data['prediction']['predicted_footfall']
                model_used = data.get('model_used', False)
                confidence = data['prediction']['confidence']
                
                predictions[location] = footfall
                
                print(f"  Success: {data['success']}")
                print(f"  Model used: {model_used}")
                print(f"  Predicted footfall: {footfall:,}")
                print(f"  Confidence: {confidence}")
            else:
                print(f"  Error: {response.status_code}")
                print(f"  Response: {response.text}")
                
        except Exception as e:
            print(f"  Request failed: {e}")
    
    # Check if predictions are different
    if len(predictions) > 1:
        values = list(predictions.values())
        min_val = min(values)
        max_val = max(values)
        difference = max_val - min_val
        
        print(f"\n=== Results Summary ===")
        print(f"Prediction range: {min_val:,} to {max_val:,}")
        print(f"Difference: {difference:,} visitors")
        
        if difference > 1000:
            print("✅ SUCCESS: API now produces different predictions for different locations!")
            print("✅ The identical predictions issue has been resolved!")
        else:
            print("❌ ISSUE: API still produces similar predictions for different locations")
            
        # Show all predictions
        print("\nDetailed predictions:")
        for location, prediction in predictions.items():
            print(f"  {location}: {prediction:,} visitors")
    else:
        print("⚠️ Not enough successful predictions to compare")

def test_health_endpoint():
    """Test the health endpoint"""
    print("\n=== Health Check ===")
    
    url = "http://localhost:5000/api/health"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data['status']}")
            print(f"Model loaded: {data['model_loaded']}")
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")

if __name__ == "__main__":
    print("Kashmir Tourism Prediction - API Test with New Model")
    print("=" * 60)
    
    test_health_endpoint()
    test_api_predictions()
    
    print("\n" + "=" * 60)
    print("API testing complete!")