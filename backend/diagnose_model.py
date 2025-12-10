#!/usr/bin/env python3
"""
Diagnostic script to check if the model is loading correctly and 
producing varied predictions for different locations
"""

import os
import sys
import numpy as np

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def diagnose_model():
    print("=" * 60)
    print("DIAGNOSING MODEL AND PREDICTIONS")
    print("=" * 60)
    
    try:
        # Import the app module
        from app import load_model, prepare_features, model, scaler, LOCATION_MAPPING
        
        print("\n1. MODEL LOADING STATUS:")
        print("-" * 30)
        
        # Check if model is loaded
        if model is None or scaler is None:
            print("❌ Model or scaler not loaded")
            print("Trying to load model...")
            success = load_model()
            if success:
                print("✅ Model loaded successfully")
            else:
                print("❌ Failed to load model")
                return
        else:
            print("✅ Model and scaler are already loaded")
        
        print(f"   Model type: {type(model)}")
        print(f"   Scaler type: {type(scaler)}")
        
        if hasattr(model, 'n_features_in_'):
            print(f"   Model expects {model.n_features_in_} features")
        
        print("\n2. TESTING FEATURE PREPARATION:")
        print("-" * 30)
        
        # Test different locations for January 2026
        test_cases = [
            ('Gulmarg', 2026, 1, 80000),
            ('Pahalgam', 2026, 1, 80000),
            ('Sonamarg', 2026, 1, 80000),
            ('Aharbal', 2026, 1, 80000),
        ]
        
        features_list = []
        for location, year, month, rolling_avg in test_cases:
            print(f"\nTesting {location} for {month}/{year}:")
            try:
                features = prepare_features(location, year, month, rolling_avg)
                features_list.append((location, features))
                print(f"   Features shape: {features.shape}")
                print(f"   First 5 features: {features.flatten()[:5]}")
                
                # Check if location code is different
                location_code = features.flatten()[0]
                print(f"   Location code: {location_code}")
                
            except Exception as e:
                print(f"   ❌ Error preparing features: {e}")
        
        print("\n3. TESTING MODEL PREDICTIONS:")
        print("-" * 30)
        
        predictions = []
        for location, features in features_list:
            try:
                # Scale features
                scaled_features = scaler.transform(features)
                print(f"\n{location}:")
                print(f"   Scaled features (first 5): {scaled_features.flatten()[:5]}")
                
                # Make prediction
                prediction = model.predict(scaled_features)[0]
                predictions.append((location, prediction))
                print(f"   Prediction: {int(prediction):,} visitors")
                
            except Exception as e:
                print(f"   ❌ Error making prediction: {e}")
        
        print("\n4. COMPARISON OF PREDICTIONS:")
        print("-" * 30)
        
        if len(predictions) > 1:
            for location, prediction in predictions:
                print(f"   {location}: {int(prediction):,} visitors")
            
            # Check if predictions are identical
            prediction_values = [p[1] for p in predictions]
            if len(set(prediction_values)) == 1:
                print("\n⚠️  WARNING: All predictions are identical!")
                print("   This suggests the model is not using location-specific features properly.")
            else:
                print("\n✅ Good: Predictions vary by location")
        else:
            print("   Not enough predictions to compare")
            
    except ImportError as e:
        print(f"❌ Could not import app module: {e}")
    except Exception as e:
        print(f"❌ Error during diagnosis: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("DIAGNOSIS COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    diagnose_model()