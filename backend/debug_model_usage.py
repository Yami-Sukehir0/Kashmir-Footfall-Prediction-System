"""
Debug script to check if the model is being loaded and used properly
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import load_model, model, scaler, metadata, prepare_features, LOCATION_MAPPING
import numpy as np

def test_model_loading():
    print("Testing model loading...")
    success = load_model()
    print(f"Model loading success: {success}")
    print(f"Model loaded: {model is not None}")
    print(f"Scaler loaded: {scaler is not None}")
    print(f"Metadata loaded: {metadata is not None}")
    
    if metadata:
        print(f"Metadata content: {metadata}")
    
    return success

def test_feature_preparation():
    print("\nTesting feature preparation...")
    # Test with different locations
    locations = ['Gulmarg', 'Pahalgam']
    year = 2026
    month = 1
    
    for location in locations:
        print(f"\nLocation: {location}")
        features = prepare_features(location, year, month, 80000)
        print(f"Features shape: {features.shape}")
        print(f"Features: {features}")
        
        # Check if location code is different
        location_code = LOCATION_MAPPING.get(location, 3)
        print(f"Location code: {location_code}")

def test_model_prediction():
    print("\nTesting model prediction...")
    if model is None or scaler is None:
        print("Model or scaler not loaded!")
        return
        
    # Test with different locations
    locations = ['Gulmarg', 'Pahalgam']
    year = 2026
    month = 1
    
    for location in locations:
        print(f"\nPredicting for {location}...")
        features = prepare_features(location, year, month, 80000)
        scaled_features = scaler.transform(features)
        print(f"Scaled features: {scaled_features}")
        
        prediction = model.predict(scaled_features)[0]
        print(f"Prediction: {prediction}")

if __name__ == "__main__":
    print("=== Model Debug Script ===")
    test_model_loading()
    test_feature_preparation()
    test_model_prediction()