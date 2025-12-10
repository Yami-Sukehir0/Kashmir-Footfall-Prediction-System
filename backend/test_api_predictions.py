"""
Test script to simulate API calls and check predictions
"""
import requests
import json

def test_predictions():
    # Start the Flask app in a separate terminal first
    # Then run this script
    
    url = "http://localhost:5000/api/predict"
    
    # Test data for different locations
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
        }
    ]
    
    for case in test_cases:
        print(f"\nTesting prediction for {case['location']}...")
        try:
            response = requests.post(url, json=case)
            if response.status_code == 200:
                data = response.json()
                print(f"Success: {data['success']}")
                print(f"Model used: {data.get('model_used', 'Not specified')}")
                print(f"Location: {data['prediction']['location']}")
                print(f"Predicted footfall: {data['prediction']['predicted_footfall']:,}")
                print(f"Confidence: {data['prediction']['confidence']}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"Request failed: {e}")

if __name__ == "__main__":
    test_predictions()