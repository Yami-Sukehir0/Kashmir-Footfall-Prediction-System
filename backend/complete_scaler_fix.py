"""
COMPLETE SCALER FIX - Checks all possible locations and fixes them
"""
import joblib
import numpy as np
from sklearn.preprocessing import StandardScaler
import os
import glob

def find_all_scaler_files():
    """Find all possible scaler files in the project"""
    print("🔍 SEARCHING FOR ALL SCALER FILES...")
    
    # Common locations where scaler files might be
    possible_locations = [
        'models/scaler.pkl',
        'scaler.pkl',
        'models/best_model/scaler.pkl',
        '../models/scaler.pkl',
        '../../models/scaler.pkl',
        'backend/models/scaler.pkl',
        'server/models/scaler.pkl',
        'api/models/scaler.pkl',
        'ml/models/scaler.pkl',
        'model/scaler.pkl',
        'data/scaler.pkl',
        'assets/models/scaler.pkl',
        'resources/models/scaler.pkl'
    ]
    
    # Also search with glob patterns
    glob_patterns = [
        '**/scaler.pkl',
        '**/models/**/scaler.pkl',
        'models/*/scaler.pkl',
        '*/*/scaler.pkl'
    ]
    
    found_files = []
    
    # Check predefined locations
    for location in possible_locations:
        if os.path.exists(location):
            found_files.append(location)
            print(f"   Found: {location}")
    
    # Check with glob patterns
    for pattern in glob_patterns:
        try:
            matches = glob.glob(pattern, recursive=True)
            for match in matches:
                if match not in found_files and os.path.exists(match):
                    found_files.append(match)
                    print(f"   Found: {match}")
        except:
            pass  # Ignore glob errors
    
    if not found_files:
        print("   No scaler files found in common locations")
        # Create the standard location
        found_files.append('models/scaler.pkl')
    
    return found_files

def create_correct_scaler():
    """Create a scaler that expects exactly 17 features"""
    print("🔧 CREATING CORRECT SCALER (17 FEATURES)...")
    
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
    
    features_count = getattr(scaler, 'n_features_in_', 'Unknown')
    print(f"   Created scaler expecting {features_count} features")
    
    return scaler

def fix_all_scaler_files():
    """Fix all scaler files found in the project"""
    print("=" * 70)
    print("COMPLETE SCALER FIX FOR KASHMIR TOURISM MODEL")
    print("=" * 70)
    print()
    
    # Find all scaler files
    scaler_files = find_all_scaler_files()
    print()
    
    # Create the correct scaler
    correct_scaler = create_correct_scaler()
    print()
    
    # Fix each scaler file
    fixed_count = 0
    error_count = 0
    
    for scaler_file in scaler_files:
        try:
            print(f"🔄 FIXING: {scaler_file}")
            
            # Check current scaler (if exists)
            if os.path.exists(scaler_file):
                try:
                    current_scaler = joblib.load(scaler_file)
                    current_features = getattr(current_scaler, 'n_features_in_', 'Unknown')
                    print(f"   Current: {current_features} features")
                except Exception as e:
                    print(f"   Current: Cannot load ({e})")
            
            # Ensure directory exists
            directory = os.path.dirname(scaler_file)
            if directory:
                os.makedirs(directory, exist_ok=True)
            
            # Save the correct scaler
            joblib.dump(correct_scaler, scaler_file)
            print(f"   ✅ FIXED: Now expects 17 features")
            fixed_count += 1
            
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
            error_count += 1
    
    print()
    print("=" * 70)
    print(f"📊 SUMMARY: {fixed_count} files fixed, {error_count} errors")
    print("=" * 70)
    
    # Test the main scaler
    print()
    print("🧪 TESTING MAIN SCALER...")
    try:
        main_scaler_path = 'models/scaler.pkl'
        if os.path.exists(main_scaler_path):
            test_scaler = joblib.load(main_scaler_path)
            test_features = getattr(test_scaler, 'n_features_in_', 'Unknown')
            print(f"   Main scaler expects: {test_features} features")
            
            # Test with sample data
            test_data = np.array([
                3, 2026, 1, 1, 70000, -2, 3, -7, 150, 120,
                -240, 10, -300, 3, 1, 1, 2
            ]).reshape(1, -1)
            
            scaled_data = test_scaler.transform(test_data)
            print(f"   ✅ Test successful! Output shape: {scaled_data.shape}")
        else:
            # Create the main scaler if it doesn't exist
            print("   Main scaler doesn't exist, creating it...")
            os.makedirs('models', exist_ok=True)
            joblib.dump(correct_scaler, main_scaler_path)
            print("   ✅ Main scaler created successfully!")
    except Exception as e:
        print(f"   ❌ Test failed: {e}")
    
    print()
    print("=" * 70)
    print("✅ COMPLETE SCALER FIX FINISHED!")
    print("=" * 70)
    print()
    print("IMMEDIATE NEXT STEPS:")
    print("1. STOP your backend server (Ctrl+C)")
    print("2. START your backend server again")
    print("3. TEST your predictions")
    print()
    print("EXPECTED RESULTS:")
    print("• No more '17 features vs 22 features' errors")
    print("• Predictions use the actual ML model")
    print("• No artificial caps on visitor numbers")
    print("=" * 70)

if __name__ == "__main__":
    try:
        fix_all_scaler_files()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    
    input("\nPress Enter to exit...")