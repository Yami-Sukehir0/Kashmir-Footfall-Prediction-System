import joblib
import sys
import os

# Change to backend directory
os.chdir(r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend')

print("Checking model type...")
print("=" * 50)

try:
    # Load the model
    model = joblib.load('models/best_model/model.pkl')
    print(f"Model type: {type(model).__name__}")
    print(f"Expected features: {model.n_features_in_}")
    
    # Load the scaler
    scaler = joblib.load('models/scaler.pkl')
    print(f"Scaler features: {scaler.n_features_in_}")
    
    # Load the metadata
    metadata = joblib.load('models/best_model_metadata.pkl')
    print(f"Metadata: {metadata}")
    
    print("\n" + "=" * 50)
    print("SUCCESS: Model files loaded correctly!")
    
except Exception as e:
    print(f"Error loading model files: {e}")
    import traceback
    traceback.print_exc()

input("\nPress Enter to exit...")