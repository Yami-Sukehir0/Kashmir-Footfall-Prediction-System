#!/usr/bin/env python3
"""
Debug script to test model predictions and understand the transformation
"""

import joblib
import numpy as np
from app import prepare_features

# Load model and scaler
model = joblib.load('models/best_model/model.pkl')
scaler = joblib.load('models/scaler.pkl')

print("=== Model Debug Information ===")
print(f"Model type: {type(model).__name__}")
print(f"Expected features: {model.n_features_in_}")
print(f"Scaler features: {scaler.n_features_in_}")

# Test different log values to understand the transformation
print("\n=== Understanding log transformation ===")
test_log_values = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
for log_val in test_log_values:
    try:
        transformed = np.expm1(log_val)
        print(f"log={log_val:.1f} -> expm1={transformed:.0f}")
    except:
        transformed = np.exp(log_val) - 1
        print(f"log={log_val:.1f} -> exp-1={transformed:.0f}")

# Test what inputs give us reasonable outputs
print("\n=== Finding reasonable inputs ===")

# Try a range of values to see what gives us good predictions
best_prediction = 0
best_log_value = 0
best_features = None

# Generate random features and test them
np.random.seed(42)  # For reproducibility
for i in range(1000):
    # Generate random features that are reasonable
    random_features = np.array([
        np.random.randint(1, 11),           # location (1-10)
        np.random.randint(2020, 2026),      # year
        np.random.randint(1, 13),           # month
        np.random.randint(1, 5),            # season
        np.random.randint(50000, 150000),   # rolling_avg
        np.random.uniform(-10, 30),         # temp_mean
        np.random.uniform(-5, 35),          # temp_max
        np.random.uniform(-15, 25),         # temp_min
        np.random.uniform(0, 200),          # precip
        np.random.uniform(0, 300),          # sunshine
        np.random.uniform(-5000, 5000),     # temp_sunshine_interaction
        np.random.uniform(0, 40),           # temp_range
        np.random.uniform(-5000, 5000),     # precip_temp
        np.random.randint(0, 10),           # holiday_count
        np.random.randint(0, 5),            # long_weekend_count
        np.random.randint(0, 5),            # national_holiday_count
        np.random.randint(0, 5)             # festival_holiday_count
    ]).reshape(1, -1)
    
    # Scale the features
    subset_mean = scaler.mean_[:17]
    subset_scale = scaler.scale_[:17]
    scaled_features = (random_features - subset_mean) / subset_scale
    
    # Predict
    try:
        prediction_log = model.predict(scaled_features)[0]
        
        # Check if this is a better prediction
        if prediction_log > best_log_value and prediction_log < 10:  # Reasonable range
            best_log_value = prediction_log
            best_features = random_features.copy()
            
        # If we found a good prediction, break
        if prediction_log > 2.0:  # This should give us a reasonable number of visitors
            print(f"Found good prediction! Log value: {prediction_log:.4f}")
            try:
                final_pred = np.expm1(prediction_log)
                print(f"Final prediction: {int(final_pred):,} visitors")
                print(f"Features: {random_features}")
                break
            except:
                final_pred = np.exp(prediction_log) - 1
                print(f"Final prediction (exp fallback): {int(final_pred):,} visitors")
                print(f"Features: {random_features}")
                break
    except Exception as e:
        continue

# If we found good features, let's test them with our actual locations
if best_features is not None:
    print(f"\n=== Testing with best features found ===")
    print(f"Best log value: {best_log_value:.4f}")
    try:
        final_pred = np.expm1(best_log_value)
        print(f"Best final prediction: {int(final_pred):,} visitors")
    except:
        final_pred = np.exp(best_log_value) - 1
        print(f"Best final prediction (exp fallback): {int(final_pred):,} visitors")
else:
    print("\n=== No good predictions found in random search ===")
    
    # Let's try a more systematic approach
    print("=== Testing with systematic values ===")
    
    # Try some systematic values that might work
    systematic_features = [
        # High tourism months
        [8, 2024, 6, 3, 100000, 25, 30, 20, 30, 280, 7000, 10, 750, 2, 1, 1, 1],  # June, high temp, lots of sunshine
        [8, 2024, 7, 3, 90000, 28, 33, 23, 20, 300, 8400, 10, 560, 1, 0, 0, 1],   # July, summer peak
        # Low tourism months
        [3, 2024, 12, 1, 60000, -2, 3, -7, 150, 120, -240, 10, -300, 4, 2, 2, 2], # December, winter, Gulmarg
        [8, 2024, 1, 1, 50000, 2, 7, -3, 120, 140, 280, 10, 240, 3, 1, 1, 2],     # January, winter
    ]
    
    for i, feature_list in enumerate(systematic_features):
        features = np.array(feature_list).reshape(1, -1)
        subset_mean = scaler.mean_[:17]
        subset_scale = scaler.scale_[:17]
        scaled_features = (features - subset_mean) / subset_scale
        
        try:
            prediction_log = model.predict(scaled_features)[0]
            print(f"Systematic test {i+1}: log={prediction_log:.4f}")
            
            try:
                final_pred = np.expm1(prediction_log)
                print(f"  Final prediction: {int(final_pred):,} visitors")
            except:
                final_pred = np.exp(prediction_log) - 1
                print(f"  Final prediction (exp fallback): {int(final_pred):,} visitors")
        except Exception as e:
            print(f"Systematic test {i+1}: Error - {e}")