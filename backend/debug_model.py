import os
import joblib
import numpy as np

# Set the paths
MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
SCALER_PATH = os.path.join('models', 'scaler.pkl')
METADATA_PATH = os.path.join('models', 'best_model_metadata.pkl')

print("Checking model files...")
print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
print(f"Scaler file exists: {os.path.exists(SCALER_PATH)}")
print(f"Metadata file exists: {os.path.exists(METADATA_PATH)}")

if os.path.exists(MODEL_PATH):
    print(f"Model file size: {os.path.getsize(MODEL_PATH)} bytes")

if os.path.exists(SCALER_PATH):
    print(f"Scaler file size: {os.path.getsize(SCALER_PATH)} bytes")

if os.path.exists(METADATA_PATH):
    print(f"Metadata file size: {os.path.getsize(METADATA_PATH)} bytes")

model = None
scaler = None
metadata = None

try:
    print("\nLoading model...")
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully!")
    print(f"Model type: {type(model)}")
    
    if hasattr(model, 'n_features_in_'):
        print(f"Expected features: {model.n_features_in_}")
    
    # Try to get model info
    if hasattr(model, 'get_params'):
        params = model.get_params()
        print(f"Model params: {params}")
        
except Exception as e:
    print(f"Error loading model: {e}")

try:
    print("\nLoading scaler...")
    scaler = joblib.load(SCALER_PATH)
    print(f"Scaler loaded successfully!")
    print(f"Scaler type: {type(scaler)}")
    
    if hasattr(scaler, 'n_features_in_'):
        print(f"Scaler features: {scaler.n_features_in_}")
        
except Exception as e:
    print(f"Error loading scaler: {e}")

try:
    print("\nLoading metadata...")
    metadata = joblib.load(METADATA_PATH)
    print(f"Metadata loaded successfully!")
    print(f"Metadata type: {type(metadata)}")
    print(f"Metadata content: {metadata}")
        
except Exception as e:
    print(f"Error loading metadata: {e}")

# Test with sample features
try:
    print("\nTesting with sample features...")
    # Create sample features (17 features as expected by the model)
    sample_features = np.array([[3, 2024, 12, 1, 80000, -2, 3, -7, 150, 120, -240, 10, -300, 3, 1, 1, 2]])
    print(f"Sample features shape: {sample_features.shape}")
    
    if scaler is not None:
        scaled_features = scaler.transform(sample_features)
        print(f"Scaled features shape: {scaled_features.shape}")
        
    if model is not None:
        prediction = model.predict(sample_features)
        print(f"Prediction: {prediction}")
        
except Exception as e:
    print(f"Error during prediction test: {e}")
    import traceback
    traceback.print_exc()