import joblib
import numpy as np

# Load the scaler
scaler = joblib.load('models/scaler.pkl')

# Check how many features it expects
print(f"Number of features expected: {scaler.n_features_in_}")

# If the scaler has feature names, print them
if hasattr(scaler, 'feature_names_in_'):
    print("\nFeature names:")
    for i, name in enumerate(scaler.feature_names_in_, 1):
        print(f"{i}. {name}")
else:
    print("\nScaler doesn't have feature names stored")
