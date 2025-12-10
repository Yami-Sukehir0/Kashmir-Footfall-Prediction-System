#!/usr/bin/env python3
"""
Verify that the app loads the correct model with log transformation metadata
"""

import joblib
import os

def main():
    print("Verifying model loading...")
    
    # Paths as used in app.py
    MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
    SCALER_PATH = os.path.join('models', 'scaler.pkl')
    METADATA_PATH = os.path.join('models', 'best_model', 'metadata.pkl')
    
    print(f"Model path: {MODEL_PATH}")
    print(f"Scaler path: {SCALER_PATH}")
    print(f"Metadata path: {METADATA_PATH}")
    
    # Check if files exist
    print(f"\nModel file exists: {os.path.exists(MODEL_PATH)}")
    print(f"Scaler file exists: {os.path.exists(SCALER_PATH)}")
    print(f"Metadata file exists: {os.path.exists(METADATA_PATH)}")
    
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"\nModel loaded successfully!")
        print(f"Model type: {type(model)}")
        if hasattr(model, 'n_features_in_'):
            print(f"Number of features: {model.n_features_in_}")
    
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
        print(f"\nScaler loaded successfully!")
        print(f"Scaler type: {type(scaler)}")
    
    if os.path.exists(METADATA_PATH):
        metadata = joblib.load(METADATA_PATH)
        print(f"\nMetadata loaded successfully!")
        print(f"Metadata keys: {list(metadata.keys())}")
        if 'target_transform' in metadata:
            print(f"Target transform: {metadata['target_transform']}")
        if 'test_metrics' in metadata:
            print(f"Test R2: {metadata['test_metrics'].get('R2', 'N/A')}")

if __name__ == '__main__':
    main()