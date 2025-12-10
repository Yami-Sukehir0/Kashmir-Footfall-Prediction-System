#!/usr/bin/env python3
"""
Test the API endpoint to verify that it produces realistic predictions
especially for peak winter season in Gulmarg
"""

import requests
import json
import time

def test_gulmarg_january_prediction():
    """Test Gulmarg prediction for January 2026"""
    print("=" * 60)
    print("Testing API Endpoint for Gulmarg in January 2026")
    print("=" * 60)
    
    url = 'http://127.0.0.1:5000/api/predict'
    data = {
        "location": "Gulmarg",
        "year": 2026,
        "month": 1,
        "rolling_avg": 100000
    }
    
    print(f"Sending request to {url}")
    print(f"Request data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data, timeout=15)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result['success']}")
            print(f"Model used: {result['model_used']}")
            
            prediction_data = result['prediction']
            predicted_footfall = prediction_data['predicted_footfall']
            
            print(f"\nPredicted footfall: {predicted_footfall:,} visitors")
            print(f"In lakhs range (≥100,000): {predicted_footfall >= 100000}")
            
            # Print insights
            print(f"\nInsights:")
            for insight in prediction_data['insights']:
                print(f"  • {insight}")
            
            if predicted_footfall >= 100000:
                print(f"\n✅ SUCCESS: Prediction is in LAKHS range as required!")
                print(f"   Gulmarg in January 2026 predicts {predicted_footfall:,} visitors")
                return True
            else:
                print(f"\n❌ FAILED: Prediction is NOT in LAKHS range!")
                return False
        else:
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Could not connect to the API server")
        print("   Make sure the Flask server is running (python app.py)")
        return False
    except Exception as e:
        print(f"❌ FAILED: An error occurred: {str(e)}")
        return False

def test_other_scenarios():
    """Test other scenarios to ensure realistic variations"""
    print("\n" + "=" * 60)
    print("Testing Other Scenarios")
    print("=" * 60)
    
    test_cases = [
        {"location": "Pahalgam", "year": 2026, "month": 1, "rolling_avg": 50000},
        {"location": "Pahalgam", "year": 2026, "month": 7, "rolling_avg": 50000},
        {"location": "Sonamarg", "year": 2026, "month": 1, "rolling_avg": 30000},
        {"location": "Sonamarg", "year": 2026, "month": 7, "rolling_avg": 30000},
    ]
    
    url = 'http://127.0.0.1:5000/api/predict'
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i}: {case['location']} Month {case['month']} ---")
        try:
            response = requests.post(url, json=case, timeout=10)
            if response.status_code == 200:
                result = response.json()
                predicted_footfall = result['prediction']['predicted_footfall']
                print(f"Predicted footfall: {predicted_footfall:,} visitors")
            else:
                print(f"Error: Status {response.status_code}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("Kashmir Tourism Footfall Prediction - API Endpoint Test")
    print("Verifying that API produces realistic predictions in LAKHS range for peak seasons\n")
    
    # Give the server a moment to fully start
    time.sleep(2)
    
    success = test_gulmarg_january_prediction()
    test_other_scenarios()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 API TEST COMPLETE: Endpoint produces realistic predictions in LAKHS range for peak winter season!")
        print("   Gulmarg in January 2026 now predicts visitor counts in the hundreds of thousands range.")
    else:
        print("⚠️  API TEST INCOMPLETE: There may be issues with the API endpoint.")
    print("=" * 60)