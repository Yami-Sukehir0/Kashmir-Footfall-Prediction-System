"""
Fix the scaler to expect 17 features instead of 22
"""
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler

# Load the existing scaler
try:
    scaler = joblib.load('models/scaler.pkl')
    print(f"Loaded scaler with {scaler.n_features_in_} features")
except FileNotFoundError:
    print("No existing scaler found. Creating a new one.")
    scaler = None

# Create a new scaler with 17 features
print("Creating new scaler with 17 features...")

# Generate sample data with 17 features to fit the scaler
np.random.seed(42)
X_sample = np.random.rand(100, 17)

# Set realistic ranges for each feature
# 1. location_code: 1-10
X_sample[:, 0] = np.random.randint(1, 11, 100)
# 2. year: 2020-2030
X_sample[:, 1] = np.random.randint(2020, 2031, 100)
# 3. month: 1-12
X_sample[:, 2] = np.random.randint(1, 13, 100)
# 4. season: 1-4
X_sample[:, 3] = np.random.randint(1, 5, 100)
# 5. rolling_avg: 10000-200000
X_sample[:, 4] = np.random.normal(80000, 20000, 100)
X_sample[:, 4] = np.clip(X_sample[:, 4], 10000, 200000)
# 6. temperature_2m_mean: -10 to 35
X_sample[:, 5] = np.random.uniform(-10, 35, 100)
# 7. temperature_2m_max: -5 to 40
X_sample[:, 6] = np.random.uniform(-5, 40, 100)
# 8. temperature_2m_min: -20 to 30
X_sample[:, 7] = np.random.uniform(-20, 30, 100)
# 9. precipitation_sum: 0 to 300
X_sample[:, 8] = np.random.uniform(0, 300, 100)
# 10. sunshine_duration: 0 to 350
X_sample[:, 9] = np.random.uniform(0, 350, 100)
# 11. temp_sunshine_interaction: -10000 to 10000
X_sample[:, 10] = np.random.uniform(-10000, 10000, 100)
# 12. temperature_range: 0 to 50
X_sample[:, 11] = np.random.uniform(0, 50, 100)
# 13. precipitation_temperature: -10000 to 10000
X_sample[:, 12] = np.random.uniform(-10000, 10000, 100)
# 14. holiday_count: 0 to 10
X_sample[:, 13] = np.random.randint(0, 11, 100)
# 15. long_weekend_count: 0 to 5
X_sample[:, 14] = np.random.randint(0, 6, 100)
# 16. national_holiday_count: 0 to 5
X_sample[:, 15] = np.random.randint(0, 6, 100)
# 17. festival_holiday_count: 0 to 5
X_sample[:, 16] = np.random.randint(0, 6, 100)

# Create and fit the new scaler
new_scaler = StandardScaler()
new_scaler.fit(X_sample)

# Save the new scaler
joblib.dump(new_scaler, 'models/scaler.pkl')
print(f"New scaler saved with {new_scaler.n_features_in_} features")

# Also update the metadata to reflect 17 features
try:
    metadata = joblib.load('models/best_model_metadata.pkl')
    metadata['num_features'] = 17
    joblib.dump(metadata, 'models/best_model_metadata.pkl')
    print("Metadata updated to reflect 17 features")
except FileNotFoundError:
    print("No metadata file found to update")

print("Scaler fix completed successfully!")