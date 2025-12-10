"""
Verification script to confirm the definitive fix worked correctly
"""
import joblib
import numpy as np
import os

def verify_fix():
    """Verify that the definitive fix worked correctly"""
    print("=" * 80)
    print("VERIFICATION OF DEFINITIVE FIX")
    print("=" * 80)
    print()
    
    # Paths used by app.py
    MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
    SCALER_PATH = os.path.join('models', 'scaler.pkl')
    METADATA_PATH = os.path.join('models', 'best_model', 'metadata.pkl')
    
    print("📍 CHECKING EXACT PATHS USED BY APP.PY:")
    print(f"   Model: {MODEL_PATH}")
    print(f"   Scaler: {SCALER_PATH}")
    print(f"   Metadata: {METADATA_PATH}")
    print()
    
    # Check if files exist
    print("🔍 CHECKING IF FILES EXIST...")
    all_exist = True
    for path in [MODEL_PATH, SCALER_PATH, METADATA_PATH]:
        if os.path.exists(path):
            print(f"   ✅ Found: {path}")
        else:
            print(f"   ❌ Missing: {path}")
            all_exist = False
    
    if not all_exist:
        print("\n❌ Some files are missing. Run the definitive fix first.")
        return False
    
    print()
    
    # Load and verify components
    print("🔍 LOADING AND VERIFYING COMPONENTS...")
    
    try:
        # Load model
        model = joblib.load(MODEL_PATH)
        model_features = model.n_features_in_
        print(f"   Model loaded successfully")
        print(f"   Model expects: {model_features} features")
        
        # Load scaler
        scaler = joblib.load(SCALER_PATH)
        scaler_features = scaler.n_features_in_
        print(f"   Scaler loaded successfully")
        print(f"   Scaler expects: {scaler_features} features")
        
        # Load metadata
        metadata = joblib.load(METADATA_PATH)
        metadata_features = metadata.get('num_features', 'Unknown')
        print(f"   Metadata loaded successfully")
        print(f"   Metadata features: {metadata_features}")
        
        print()
        
        # Check consistency
        print("🔍 CHECKING CONSISTENCY...")
        if model_features == scaler_features == metadata_features == 17:
            print("   ✅ ALL COMPONENTS CONSISTENTLY USE 17 FEATURES!")
        else:
            print("   ❌ INCONSISTENCY DETECTED:")
            print(f"     Model: {model_features}")
            print(f"     Scaler: {scaler_features}")
            print(f"     Metadata: {metadata_features}")
            return False
        
        print()
        
        # Test end-to-end prediction
        print("🧪 TESTING END-TO-END PREDICTION...")
        
        # Create test data exactly matching prepare_features
        test_data = np.array([
            3,      # location (Gulmarg)
            2026,   # year
            1,      # month (January)
            1,      # season (Winter)
            70000,  # rolling_avg
            -2,     # temperature_2m_mean
            3,      # temperature_2m_max
            -7,     # temperature_2m_min
            150,    # precipitation_sum
            120,    # sunshine_duration
            -240,   # temp_sunshine_interaction
            10,     # temperature_range
            -300,   # precipitation_temperature
            3,      # holiday_count
            1,      # long_weekend_count
            1,      # national_holiday_count
            2       # festival_holiday_count
        ]).reshape(1, -1)
        
        print(f"   Test data shape: {test_data.shape}")
        
        # Test scaling
        try:
            scaled_data = scaler.transform(test_data)
            print(f"   ✅ Scaling successful - shape: {scaled_data.shape}")
        except Exception as e:
            print(f"   ❌ Scaling failed: {e}")
            return False
        
        # Test prediction
        try:
            prediction = model.predict(scaled_data)
            print(f"   ✅ Prediction successful: {int(prediction[0]):,} visitors")
        except Exception as e:
            print(f"   ❌ Prediction failed: {e}")
            return False
        
        print()
        print("=" * 80)
        print("🎉 VERIFICATION SUCCESSFUL!")
        print("=" * 80)
        print()
        print("ALL CHECKS PASSED:")
        print("✅ Model expects 17 features")
        print("✅ Scaler expects 17 features") 
        print("✅ Metadata confirms 17 features")
        print("✅ All components are consistent")
        print("✅ End-to-end prediction works")
        print("✅ No feature mismatch errors")
        print()
        print("YOUR SYSTEM IS NOW READY!")
        print("1. Restart your backend server")
        print("2. The logs should show 'Features: 17'")
        print("3. Predictions should work without errors")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        success = verify_fix()
        if not success:
            print("\n❌ VERIFICATION FAILED")
            print("Please run the definitive fix and try again.")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
    
    input("\nPress Enter to exit...")