#!/usr/bin/env python3
"""
Test the newly retrained model to verify improved location sensitivity
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import load_model, model, scaler, prepare_features, LOCATION_MAPPING
import numpy as np

def test_new_model():
    """Test the newly retrained model"""
    print("Testing newly retrained model...")
    
    # Reload the model to make sure we're using the new one
    success = load_model()
    print(f"Model reload success: {success}")
    print(f"Model loaded: {model is not None}")
    print(f"Scaler loaded: {scaler is not None}")
    
    if not model:
        print("Failed to load model!")
        return
    
    print("\n=== Testing Location Sensitivity ===")
    
    # Test with different locations for January 2026
    test_cases = [
        {"location": "Gulmarg", "year": 2026, "month": 1},
        {"location": "Pahalgam", "year": 2026, "month": 1},
        {"location": "Sonamarg", "year": 2026, "month": 1},
        {"location": "Aharbal", "year": 2026, "month": 1},
        {"location": "Doodpathri", "year": 2026, "month": 1},
        {"location": "Kokernag", "year": 2026, "month": 1},
        {"location": "Lolab", "year": 2026, "month": 1},
        {"location": "Manasbal", "year": 2026, "month": 1},
        {"location": "Gurez", "year": 2026, "month": 1},
        {"location": "Yousmarg", "year": 2026, "month": 1}
    ]
    
    predictions = {}
    
    for case in test_cases:
        location = case["location"]
        year = case["year"]
        month = case["month"]
        
        # Prepare features
        features = prepare_features(location, year, month, 80000)
        
        # Scale features
        scaled_features = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(scaled_features)[0]
        predictions[location] = prediction
        
        print(f"{location:12}: {prediction:,.0f} visitors")
    
    # Check diversity
    values = list(predictions.values())
    min_val = min(values)
    max_val = max(values)
    difference = max_val - min_val
    
    print(f"\nPrediction range: {min_val:,.0f} to {max_val:,.0f}")
    print(f"Difference: {difference:,.0f} visitors")
    
    # Count unique predictions (rounded to nearest 100)
    unique_predictions = len(set([round(v, -2) for v in values]))
    print(f"Unique predictions: {unique_predictions}/{len(predictions)}")
    
    if unique_predictions >= 8 and difference > 5000:
        print("✅ SUCCESS: Model shows good location sensitivity!")
        return True
    else:
        print("❌ ISSUE: Model still shows poor location sensitivity!")
        return False

def test_feature_importance():
    """Display feature importances of the new model"""
    print("\n=== Feature Importances ===")
    
    if not model:
        print("No model loaded!")
        return
    
    feature_names = [
        "Location code", "Year", "Month", "Season", "Rolling avg",
        "Temp mean", "Temp max", "Temp min", "Precipitation", "Sunshine",
        "Temp-sunshine interaction", "Temperature range", "Precipitation-temp",
        "Holiday count", "Long weekend", "National holiday", "Festival holiday"
    ]
    
    importances = model.feature_importances_
    
    # Sort by importance
    sorted_indices = sorted(range(len(importances)), key=lambda i: importances[i], reverse=True)
    
    print("Top 5 most important features:")
    for i in range(min(5, len(sorted_indices))):
        idx = sorted_indices[i]
        print(f"  {i+1}. {feature_names[idx]}: {importances[idx]:.4f}")
    
    # Check location importance
    location_importance = importances[0]  # Location is first feature
    print(f"\nLocation importance: {location_importance:.4f}")
    
    if location_importance > 0.05:
        print("✅ Location is a significant feature")
    else:
        print("⚠️ Location importance is still relatively low")

if __name__ == "__main__":
    print("Kashmir Tourism Prediction - New Model Test")
    print("=" * 50)
    
    success = test_new_model()
    test_feature_importance()
    
    if success:
        print("\n🎉 New model successfully addresses the location sensitivity issue!")
    else:
        print("\n⚠️ New model still has issues with location sensitivity.")