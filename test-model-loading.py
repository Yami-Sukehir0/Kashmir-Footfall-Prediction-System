import joblib
import os

print("Testing model loading...")

# Change to backend directory
os.chdir(r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend')

# Define paths
MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
SCALER_PATH = os.path.join('models', 'scaler.pkl')
METADATA_PATH = os.path.join('models', 'best_model_metadata.pkl')

print(f"Current directory: {os.getcwd()}")
print(f"Model path: {MODEL_PATH}")
print(f"Scaler path: {SCALER_PATH}")
print(f"Metadata path: {METADATA_PATH}")

# Check if files exist
for path, name in [(MODEL_PATH, "Model"), (SCALER_PATH, "Scaler"), (METADATA_PATH, "Metadata")]:
    if os.path.exists(path):
        size = os.path.getsize(path)
        print(f"✓ {name} file exists ({size} bytes)")
    else:
        print(f"✗ {name} file NOT found: {path}")

# Try to load the model
try:
    print("\nLoading model...")
    model = joblib.load(MODEL_PATH)
    print(f"✓ Model loaded successfully")
    print(f"  Model type: {type(model).__name__}")
    print(f"  Expected features: {model.n_features_in_}")
    
    # Try to load scaler
    print("\nLoading scaler...")
    scaler = joblib.load(SCALER_PATH)
    print(f"✓ Scaler loaded successfully")
    print(f"  Expected features: {scaler.n_features_in_}")
    
    # Try to load metadata
    print("\nLoading metadata...")
    metadata = joblib.load(METADATA_PATH)
    print(f"✓ Metadata loaded successfully")
    print(f"  Metadata content: {metadata}")
    
except Exception as e:
    print(f"✗ Error loading model components: {e}")
    import traceback
    traceback.print_exc()

input("\nPress Enter to exit...")