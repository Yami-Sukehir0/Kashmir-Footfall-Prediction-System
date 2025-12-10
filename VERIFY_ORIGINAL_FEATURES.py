"""
VERIFY ORIGINAL FEATURES - Check what the original model actually expects
"""
import joblib
import os
import numpy as np

def verify_original_features():
    """Verify what features the original model expects"""
    print("=" * 60)
    print("VERIFYING ORIGINAL MODEL FEATURE COUNT")
    print("=" * 60)
    print()
    
    # Paths to original model files
    model_path = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model\model.pkl'
    scaler_path = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\scaler.pkl'
    
    print("Loading original model files...")
    
    # Load model
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            model_features = model.n_features_in_
            print(f"✅ Model loaded successfully")
            print(f"   Model type: {type(model).__name__}")
            print(f"   Expected features: {model_features}")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            return
    else:
        print(f"❌ Model file not found: {model_path}")
        return
    
    # Load scaler
    if os.path.exists(scaler_path):
        try:
            scaler = joblib.load(scaler_path)
            scaler_features = scaler.n_features_in_
            print(f"✅ Scaler loaded successfully")
            print(f"   Expected features: {scaler_features}")
        except Exception as e:
            print(f"❌ Failed to load scaler: {e}")
            return
    else:
        print(f"❌ Scaler file not found: {scaler_path}")
        return
    
    print()
    
    # Check consistency
    if model_features == scaler_features:
        print("✅ FEATURE COUNT CONSISTENCY:")
        print(f"   Both model and scaler expect {model_features} features")
        
        if model_features == 17:
            print("🎉 PERFECT! Original model expects exactly 17 features")
            print("   This should resolve the feature mismatch error!")
        elif model_features == 22:
            print("⚠️  ISSUE: Original model expects 22 features")
            print("   This is the source of the feature mismatch error!")
            print("   The prepare_features() function creates 17 features,")
            print("   but the model expects 22 features.")
        else:
            print(f"❓ UNUSUAL: Model expects {model_features} features")
            print("   This is neither 17 nor 22 features.")
    else:
        print("❌ FEATURE COUNT INCONSISTENCY:")
        print(f"   Model expects {model_features} features")
        print(f"   Scaler expects {scaler_features} features")
        return
    
    print()
    
    # Test prediction with correct number of features
    print("Testing prediction with correct feature count...")
    try:
        # Create test data with the correct number of features
        test_features = model_features  # Use whatever the model expects
        test_data = np.random.rand(1, test_features)
        
        # Scale the data
        scaled_data = scaler.transform(test_data)
        print(f"✅ Scaling successful with {test_features} features")
        print(f"   Input shape: {test_data.shape}")
        print(f"   Scaled shape: {scaled_data.shape}")
        
        # Make prediction
        prediction = model.predict(scaled_data)
        print(f"✅ Prediction successful!")
        print(f"   Prediction result: {prediction[0]:.2f}")
        
        print()
        print("=" * 60)
        if model_features == 17:
            print("🎉 SOLUTION IDENTIFIED!")
            print("   Copy the original model files to the backend directory")
            print("   to resolve the feature mismatch error.")
        elif model_features == 22:
            print("🔍 ROOT CAUSE IDENTIFIED!")
            print("   The original model expects 22 features, but")
            print("   prepare_features() creates only 17 features.")
            print("   Need to either:")
            print("   1. Retrain model with 17 features, or")
            print("   2. Modify prepare_features() to create 22 features")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during prediction test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        verify_original_features()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    
    input("\nPress Enter to exit...")