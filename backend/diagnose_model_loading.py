import os
import sys
import joblib
import traceback

# Add the current directory to the path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the model loading code from app.py
from app import MODEL_PATH, SCALER_PATH, METADATA_PATH

def diagnose_model_loading():
    print("=" * 60)
    print("DIAGNOSING MODEL LOADING ISSUES")
    print("=" * 60)
    print()
    
    print("Checking file paths:")
    print(f"Model path: {MODEL_PATH}")
    print(f"Scaler path: {SCALER_PATH}")
    print(f"Metadata path: {METADATA_PATH}")
    print()
    
    print("Checking if files exist:")
    print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
    print(f"Scaler file exists: {os.path.exists(SCALER_PATH)}")
    print(f"Metadata file exists: {os.path.exists(METADATA_PATH)}")
    print()
    
    if os.path.exists(MODEL_PATH):
        print(f"Model file size: {os.path.getsize(MODEL_PATH)} bytes")
    if os.path.exists(SCALER_PATH):
        print(f"Scaler file size: {os.path.getsize(SCALER_PATH)} bytes")
    if os.path.exists(METADATA_PATH):
        print(f"Metadata file size: {os.path.getsize(METADATA_PATH)} bytes")
    print()
    
    # Try to load each component
    print("Attempting to load model...")
    try:
        model = joblib.load(MODEL_PATH)
        print(f"✅ Model loaded successfully!")
        print(f"   Model type: {type(model)}")
        if hasattr(model, 'n_features_in_'):
            print(f"   Expected features: {model.n_features_in_}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("Full traceback:")
        traceback.print_exc()
    print()
    
    print("Attempting to load scaler...")
    try:
        scaler = joblib.load(SCALER_PATH)
        print(f"✅ Scaler loaded successfully!")
        print(f"   Scaler type: {type(scaler)}")
        if hasattr(scaler, 'n_features_in_'):
            print(f"   Expected features: {scaler.n_features_in_}")
    except Exception as e:
        print(f"❌ Error loading scaler: {e}")
        print("Full traceback:")
        traceback.print_exc()
    print()
    
    print("Attempting to load metadata...")
    try:
        metadata = joblib.load(METADATA_PATH)
        print(f"✅ Metadata loaded successfully!")
        print(f"   Metadata type: {type(metadata)}")
        print(f"   Metadata content: {metadata}")
    except Exception as e:
        print(f"❌ Error loading metadata: {e}")
        print("Full traceback:")
        traceback.print_exc()
    print()
    
    print("=" * 60)
    print("DIAGNOSIS COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    diagnose_model_loading()