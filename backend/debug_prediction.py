#!/usr/bin/env python3
"""
Debug script to test model predictions with adjusted features
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

# Test with Gulmarg in December
location, year, month = "Gulmarg", 2024, 12
print(f"\n=== Testing {location} {year}-{month:02d} ===")

# Prepare features using our function
features = prepare_features(location, year, month, 80000)
print(f"Original features: {features}")

# Let's try to adjust the features to be closer to what the scaler expects
# Based on the scaler mean values: [5.63, 2024.71, 5.73, 2.46, 79859.31...]
# Let's adjust our features to be closer to these means

# Get the scaler means and scales for the first 17 features
subset_mean = scaler.mean_[:17]
subset_scale = scaler.scale_[:17]

print(f"Scaler means: {subset_mean}")
print(f"Scaler scales: {subset_scale}")

# Scale our features using the scaler
features_scaled = (features - subset_mean) / subset_scale
print(f"Scaled features: {features_scaled}")

# Predict
prediction_log = model.predict(features_scaled)[0]
print(f"Log prediction: {prediction_log}")

# Try to get a better prediction by adjusting the input features to be closer to the training data
print("\n=== Trying adjusted features ===")

# Let's try to create features that are closer to the mean values
adjusted_features = np.array([
    5.63,    # location (closer to mean)
    2024.71, # year (closer to mean)
    5.73,    # month (closer to mean)
    2.46,    # season (closer to mean)
    79859.31,# rolling_avg (closer to mean)
    10,      # temp_mean (reasonable value)
    15,      # temp_max (reasonable value)
    5,       # temp_min (reasonable value)
    50,      # precip (reasonable value)
    200,     # sunshine (reasonable value)
    2000,    # temp_sunshine_interaction (derived)
    10,      # temp_range (derived)
    500,     # precip_temp (derived)
    2,       # holiday_count (reasonable value)
    1,       # long_weekend_count (reasonable value)
    1,       # national_holiday_count (reasonable value)
    1        # festival_holiday_count (reasonable value)
]).reshape(1, -1)

print(f"Adjusted features: {adjusted_features}")

# Scale the adjusted features
adjusted_features_scaled = (adjusted_features - subset_mean) / subset_scale
print(f"Adjusted scaled features: {adjusted_features_scaled}")

# Predict with adjusted features
prediction_log_adjusted = model.predict(adjusted_features_scaled)[0]
print(f"Adjusted log prediction: {prediction_log_adjusted}")

# Try inverse transform
try:
    prediction_adjusted = np.expm1(prediction_log_adjusted)
    print(f"Adjusted final prediction: {int(prediction_adjusted):,}")
except:
    prediction_adjusted = np.exp(prediction_log_adjusted) - 1
    print(f"Adjusted final prediction (exp fallback): {int(prediction_adjusted):,}")

# Let's also try to understand what range of predictions the model can make
print("\n=== Testing prediction range ===")
# Try with features that are 1, 2, and 3 standard deviations from the mean
for std_dev in [1, 2, 3]:
    high_features = (subset_mean + std_dev * subset_scale).reshape(1, -1)
    low_features = (subset_mean - std_dev * subset_scale).reshape(1, -1)
    
    high_pred = model.predict(high_features)[0]
    low_pred = model.predict(low_features)[0]
    
    print(f"{std_dev} std dev high: log={high_pred:.4f}")
    print(f"{std_dev} std dev low: log={low_pred:.4f}")
    
    try:
        high_final = np.expm1(high_pred)
        low_final = np.expm1(low_pred)
        print(f"  Final predictions: high={int(high_final):,}, low={int(low_final):,}")
    except:
        print(f"  Final predictions: high={np.exp(high_pred)-1:.0f}, low={np.exp(low_pred)-1:.0f}")