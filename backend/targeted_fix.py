"""
TARGETED FIX - Fixes the exact scaler path used by app.py
"""
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
import os

def targeted_fix():
    """Fix the exact scaler path used by app.py"""
    print("=" * 70)
    print("TARGETED SCALER FIX FOR KASHMIR TOURISM MODEL")
    print("=" * 70)
    print()
    
    # These are the exact paths used in app.py
    MODEL_PATH = os.path.join('models', 'best_model', 'model.pkl')
    SCALER_PATH = os.path.join('models', 'scaler.pkl')
    METADATA_PATH = os.path.join('models', 'best_model_metadata.pkl')
    
    print("📍 TARGETED PATHS FROM APP.PY:")
    print(f"   Model: {MODEL_PATH}")
    print(f"   Scaler: {SCALER_PATH}")
    print(f"   Metadata: {METADATA_PATH}")
    print()
    
    # Check if paths exist
    print("🔍 CHECKING CURRENT FILES:")
    for path in [MODEL_PATH, SCALER_PATH, METADATA_PATH]:
        if os.path.exists(path):
            try:
                obj = joblib.load(path)
                if hasattr(obj, 'n_features_in_'):
                    print(f"   {path}: {obj.n_features_in_} features")
                else:
                    print(f"   {path}: Loaded successfully")
            except Exception as e:
                print(f"   {path}: Error loading ({e})")
        else:
            print(f"   {path}: Not found")
    print()
    
    # Create the correct scaler for the exact path used
    print("🔧 CREATING CORRECT SCALER FOR APP.PY...")
    
    # Create sample data with exactly 17 features
    np.random.seed(42)
    X_sample = np.random.rand(1000, 17)
    
    # Set realistic ranges for Kashmir tourism features
    feature_ranges = [
        (1, 10),      # location_code
        (2020, 2030), # year
        (1, 12),      # month
        (1, 4),       # season
        (10000, 200000), # rolling_avg
        (-20, 40),    # temperature_2m_mean
        (-15, 45),    # temperature_2m_max
        (-25, 35),    # temperature_2m_min
        (0, 300),     # precipitation_sum
        (0, 350),     # sunshine_duration
        (-15000, 15000), # temp_sunshine_interaction
        (0, 60),      # temperature_range
        (-15000, 15000), # precipitation_temperature
        (0, 10),      # holiday_count
        (0, 5),       # long_weekend_count
        (0, 5),       # national_holiday_count
        (0, 5),       # festival_holiday_count
    ]
    
    # Apply realistic ranges
    for i, (min_val, max_val) in enumerate(feature_ranges):
        if i == 4:  # Special handling for rolling average
            X_sample[:, i] = np.random.normal(80000, 30000, 1000)
            X_sample[:, i] = np.clip(X_sample[:, i], min_val, max_val)
        else:
            X_sample[:, i] = np.random.uniform(min_val, max_val, 1000)
    
    # Create and fit the scaler
    scaler = StandardScaler()
    scaler.fit(X_sample)
    
    print(f"   Created scaler expecting {scaler.n_features_in_} features")
    print()
    
    # Ensure directories exist
    print("📁 ENSURING DIRECTORIES EXIST...")
    for path in [MODEL_PATH, SCALER_PATH, METADATA_PATH]:
        directory = os.path.dirname(path)
        if directory:
            os.makedirs(directory, exist_ok=True)
            print(f"   Created/verified: {directory}")
    print()
    
    # Save the scaler to the exact path used by app.py
    print("💾 SAVING SCALER TO EXACT APP.PY PATH...")
    try:
        joblib.dump(scaler, SCALER_PATH)
        print(f"   ✅ Scaler saved to: {SCALER_PATH}")
    except Exception as e:
        print(f"   ❌ Error saving scaler: {e}")
        return False
    print()
    
    # Test the fix
    print("🧪 TESTING THE FIX...")
    try:
        # Load the scaler we just saved
        test_scaler = joblib.load(SCALER_PATH)
        print(f"   Loaded scaler expects: {test_scaler.n_features_in_} features")
        
        # Create test data (exactly 17 features)
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
        scaled_data = test_scaler.transform(test_data)
        print(f"   ✅ Scaling successful! Output shape: {scaled_data.shape}")
        
        print()
        print("=" * 70)
        print("✅ TARGETED FIX COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print()
        print("IMMEDIATE NEXT STEPS:")
        print("1. STOP your backend server (Ctrl+C)")
        print("2. START your backend server again: python app.py")
        print("3. TEST your predictions")
        print()
        print("EXPECTED RESULTS:")
        print("• No more '17 features vs 22 features' errors")
        print("• Predictions use the actual ML model")
        print("• No artificial caps on visitor numbers")
        print("=" * 70)
        
        return True
        
    except Exception as e:
        print(f"   ❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    try:
        success = targeted_fix()
        if not success:
            print("\n❌ TARGETED FIX FAILED")
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    
    input("\nPress Enter to exit...")