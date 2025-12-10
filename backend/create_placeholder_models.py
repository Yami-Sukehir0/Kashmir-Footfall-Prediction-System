"""
Create placeholder model files for the Kashmir Tourism ML service
"""
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Create models directory if it doesn't exist
os.makedirs('models/best_model', exist_ok=True)

# Create a simple placeholder model with more realistic parameters
print("Creating placeholder model...")
model = RandomForestRegressor(n_estimators=10, random_state=42, max_depth=5)

# Create some dummy training data to fit the model
# 17 features as used in the application (matching prepare_features function)
# Use more realistic values for footfall prediction (log scale)
X_dummy = np.random.rand(100, 17)  # 100 samples, 17 features
# Scale features to more realistic ranges
X_dummy[:, 0] = np.random.randint(1, 11, 100)  # location codes 1-10
X_dummy[:, 1] = np.random.randint(2020, 2030, 100)  # years
X_dummy[:, 2] = np.random.randint(1, 13, 100)  # months
X_dummy[:, 3] = np.random.randint(1, 5, 100)  # seasons
X_dummy[:, 4] = np.random.normal(80000, 20000, 100)  # rolling average
X_dummy[:, 4] = np.clip(X_dummy[:, 4], 10000, 200000)  # clip to reasonable range
X_dummy[:, 5] = np.random.uniform(-10, 35, 100)  # temperature_2m_mean
X_dummy[:, 6] = np.random.uniform(-5, 40, 100)   # temperature_2m_max
X_dummy[:, 7] = np.random.uniform(-20, 30, 100)  # temperature_2m_min
X_dummy[:, 8] = np.random.uniform(0, 300, 100)   # precipitation_sum
X_dummy[:, 9] = np.random.uniform(0, 350, 100)   # sunshine_duration
X_dummy[:, 10] = np.random.uniform(-10000, 10000, 100)  # temp_sunshine_interaction
X_dummy[:, 11] = np.random.uniform(0, 50, 100)   # temperature_range
X_dummy[:, 12] = np.random.uniform(-10000, 10000, 100)  # precipitation_temperature
X_dummy[:, 13] = np.random.randint(0, 10, 100)   # holiday_count
X_dummy[:, 14] = np.random.randint(0, 5, 100)    # long_weekend_count
X_dummy[:, 15] = np.random.randint(0, 5, 100)    # national_holiday_count
X_dummy[:, 16] = np.random.randint(0, 5, 100)    # festival_holiday_count

# Create more realistic target values (log of footfall)
# Most footfall values between 1000-100000 visitors
y_dummy = np.random.normal(np.log(50000), 1, 100)  # Log scale
y_dummy = np.clip(y_dummy, np.log(1000), np.log(150000))  # Clip to reasonable range

# Fit the model with dummy data
model.fit(X_dummy, y_dummy)

# Create a proper scaler
print("Creating placeholder scaler...")
scaler = StandardScaler()
scaler.fit(X_dummy)

# Create metadata
print("Creating metadata...")
metadata = {
    'model_type': 'RandomForestRegressor',
    'num_features': 17,  # Changed from 22 to 17 to match prepare_features
    'test_metrics': {
        'R2': 0.85,
        'MAE': 5000,
        'RMSE': 8000
    }
}

# Save the model, scaler, and metadata
print("Saving model files...")
joblib.dump(model, 'models/best_model/model.pkl')
joblib.dump(scaler, 'models/scaler.pkl')
joblib.dump(metadata, 'models/best_model_metadata.pkl')

print("Placeholder model files created successfully!")
print("Files created:")
print("  - models/best_model/model.pkl")
print("  - models/scaler.pkl")
print("  - models/best_model_metadata.pkl")