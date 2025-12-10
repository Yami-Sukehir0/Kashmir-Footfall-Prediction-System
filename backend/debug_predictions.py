#!/usr/bin/env python3
"""
Debug script to understand what's happening with the predictions
"""

import pandas as pd
import numpy as np
import os
import joblib
import sys
sys.path.append(r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend')

# Import the app module
import app

def debug_predictions():
    """Debug the prediction process"""
    print("🔍 Debugging Prediction Process")
    print("=" * 50)
    
    # Load model and scaler
    model = joblib.load(r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\best_model\model.pkl')
    scaler = joblib.load(r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\models\scaler.pkl')
    
    print(f"Model type: {type(model).__name__}")
    print(f"Number of features expected: {model.n_features_in_}")
    
    # Check what features look like
    print("\nFeature Analysis:")
    features = app.prepare_features("Gulmarg", 2024, 6, 80000)
    print(f"Generated features shape: {features.shape}")
    print("First few feature values:")
    for i, val in enumerate(features[0][:10]):
        print(f"  Feature {i}: {val}")
    
    # Scale features
    scaled_features = scaler.transform(features)
    print("\nScaled features (first 10):")
    for i, val in enumerate(scaled_features[0][:10]):
        print(f"  Scaled feature {i}: {val:.4f}")
    
    # Make prediction
    prediction = model.predict(scaled_features)[0]
    print(f"\nRaw model prediction: {prediction}")
    print(f"Prediction type: {type(prediction)}")
    
    # Check if this looks like a log value or linear value
    if prediction > 20:
        print("⚠️  This looks like a linear prediction, not a log prediction!")
        print("   Log values are typically between 7-12 for visitor counts")
    else:
        print("✅ This looks like a log prediction")
        
    # Try to understand what's in the model by checking the training data stats
    print("\nChecking training data characteristics:")
    try:
        # Load the log-transformed dataset
        log_data_path = r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\data\kashmir_tourism_LOG_TRANSFORMED_option2.csv'
        df = pd.read_csv(log_data_path)
        print(f"Log-transformed target statistics:")
        print(f"  Min: {df['Footfall'].min():.4f}")
        print(f"  Max: {df['Footfall'].max():.4f}")
        print(f"  Mean: {df['Footfall'].mean():.4f}")
        print(f"  Std: {df['Footfall'].std():.4f}")
        
        # Show what exp of typical values would be
        print(f"\nExp of typical log values:")
        typical_values = [8.0, 9.0, 10.0, 11.0]
        for val in typical_values:
            exp_val = np.exp(val)
            print(f"  exp({val}) = {exp_val:,.0f} visitors")
            
    except Exception as e:
        print(f"Error checking training data: {e}")

if __name__ == "__main__":
    debug_predictions()