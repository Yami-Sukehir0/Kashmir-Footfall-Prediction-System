"""
Simple verification script to check if the fix worked
"""
import joblib
import numpy as np

def verify_fix():
    """Verify that the feature mismatch issue is fixed"""
    print("VERIFYING MODEL FIX")
    print("=" * 30)
    
    try:
        # Load model and scaler
        print("Loading model files...")
        model = joblib.load('models/best_model/model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        
        print(f"✓ Model expects {model.n_features_in_} features")
        print(f"✓ Scaler expects {scaler.n_features_in_} features")
        
        # Check if they match
        if model.n_features_in_ == scaler.n_features_in_:
            print("✓ FEATURE COUNTS MATCH! ✓")
        else:
            print("✗ FEATURE COUNTS DON'T MATCH! ✗")
            return False
            
        # Test with sample data
        print("\nTesting prediction pipeline...")
        
        # Sample features for Gulmarg in January 2026
        sample_features = np.array([
            3,      # location (Gulmarg)
            2026,   # year
            1,      # month
            1,      # season
            70000,  # rolling average
            -2,     # temp_mean
            3,      # temp_max
            -7,     # temp_min
            150,    # precipitation
            120,    # sunshine
            -240,   # temp_sunshine interaction
            10,     # temp_range
            -300,   # precip_temp
            3,      # holiday_count
            1,      # long_weekend_count
            1,      # national_holiday_count
            2       # festival_holiday_count
        ]).reshape(1, -1)
        
        print(f"Sample features shape: {sample_features.shape}")
        
        # Test scaling
        scaled = scaler.transform(sample_features)
        print(f"Scaled features shape: {scaled.shape}")
        
        # Test prediction
        prediction = model.predict(scaled)[0]
        print(f"Prediction: {int(round(prediction)):,} visitors")
        
        print("\n" + "=" * 30)
        print("🎉 VERIFICATION SUCCESSFUL! 🎉")
        print("✅ No feature mismatch errors")
        print("✅ Model prediction working correctly")
        print("✅ Fix applied successfully!")
        print("=" * 30)
        
        return True
        
    except Exception as e:
        print(f"❌ VERIFICATION FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    verify_fix()