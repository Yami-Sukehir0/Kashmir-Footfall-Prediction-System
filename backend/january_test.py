import requests
import json

# Test prediction for Gulmarg in January 2026
url = "http://localhost:5000/api/predict"
data = {
    "location": "Gulmarg",
    "year": 2026,
    "month": 1
}

response = requests.post(url, json=data)
if response.status_code == 200:
    result = response.json()
    prediction = result['prediction']
    footfall = prediction['predicted_footfall']
    print(f"Gulmarg January 2026: {footfall:,} visitors")
    print(f"Target transform used: {result.get('target_transform', 'unknown')}")
    print(f"Model used: {result.get('model_used', 'unknown')}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)