"""
Debug script to test the model prediction step by step
"""
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

# Load the model and scaler
print("Loading model and scaler...")
model = joblib.load('models/best_model/model.pkl')
scaler = joblib.load('models/scaler.pkl')

print(f"Model type: {type(model)}")
print(f"Scaler type: {type(scaler)}")

# Create test features (same as in app.py)
features = np.array([[
    3,      # location_code (Gulmarg)
    2024,   # year
    12,     # month
    1,      # season (Winter)
    80000,  # rolling_avg
    -1,     # temp_mean
    4,      # temp_max
    -6,     # temp_min
    140,    # precip
    70,     # snow
    190,    # precip_hours
    34,     # wind
    74,     # humidity
    130,    # sunshine
    -130,   # temp_sunshine_interaction
    10,     # temp_range
    -140,   # precip_temp
    4,      # holiday_count
    2,      # long_weekend_count
    2,      # national_holiday_count
    2,      # festival_holiday_count
    3       # days_to_next_holiday
]]).reshape(1, -1)

print(f"Features shape: {features.shape}")
print(f"Features values: {features}")

# Scale features
features_scaled = scaler.transform(features)
print(f"Scaled features shape: {features_scaled.shape}")
print(f"Scaled features min/max: {features_scaled.min():.2f} / {features_scaled.max():.2f}")

# Make prediction
prediction_log = model.predict(features_scaled)[0]
print(f"Log prediction: {prediction_log}")

# Check for extreme values
if abs(prediction_log) > 100:
    print("WARNING: Extreme prediction value detected!")
    prediction_log = np.clip(prediction_log, -10, 10)  # Clip to reasonable range
    print(f"Clipped log prediction: {prediction_log}")

# Inverse log transform
try:
    prediction = np.expm1(prediction_log)
    print(f"Inverse log prediction: {prediction}")
except:
    print("Error in expm1, using fallback")
    prediction = np.exp(prediction_log) - 1

# Ensure non-negative and reasonable
if np.isinf(prediction) or np.isnan(prediction):
    prediction = 50000  # Default reasonable value
else:
    prediction = max(0, min(prediction, 200000))  # Clip to reasonable range

print(f"Final prediction: {prediction}")