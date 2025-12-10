#!/usr/bin/env python3
"""
Test the Flask API with log-transformed model
"""

import requests
import json

def test_prediction():
    url = "http://localhost:5000/api/predict"
    
    # Test data
    test_cases = [
        {
            "location": "Gulmarg",
            "year": 2025,
            "month": 12
        },
        {
            "location": "Gulmarg",
            "year": 2025,
            "month": 6
        },
        {
            "location": "Pahalgam",
            "year": 2025,
            "month": 12
        },
        {
            "location": "Pahalgam",
            "year": 2025,
            "month": 6
        }
    ]
    
    print("Testing API predictions...")
    print("=" * 50)
    
    for i, data in enumerate(test_cases):
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                result = response.json()
                prediction = result['prediction']
                footfall = prediction['predicted_footfall']
                target_transform = result.get('target_transform', 'unknown')
                print(f"Test {i+1}: {data['location']} {data['year']}-{data['month']:02d}")
                print(f"  Predicted footfall: {footfall:,} visitors")
                print(f"  Target transform: {target_transform}")
                print(f"  Model used: {result['model_used']}")
                print()
            else:
                print(f"Test {i+1}: Error - Status code {response.status_code}")
                print(response.text)
                print()
        except Exception as e:
            print(f"Test {i+1}: Exception - {str(e)}")
            print()

def test_locations():
    url = "http://localhost:5000/api/locations"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            result = response.json()
            locations = result['locations']
            print("Available locations:")
            for location in locations:
                print(f"  - {location}")
        else:
            print(f"Error getting locations - Status code {response.status_code}")
    except Exception as e:
        print(f"Exception getting locations - {str(e)}")

if __name__ == '__main__':
    test_locations()
    print()
    test_prediction()