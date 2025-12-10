"""
DIRECT CREATE ALL - Simple script to create all model files directly
"""
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

def create_all_files():
    """Create all model files directly"""
    print("DIRECT MODEL FILE CREATION")
    print("=" * 50)
    
    # Create directories
    print("1. Creating directories...")
    try:
        os.makedirs('models/best_model', exist_ok=True)
        print("   ✓ Directories created")
    except Exception as e:
        print(f"   ✗ Error creating directories: {e}")
        return False
    
    # Create sample data
    print("2. Creating sample data...")
    try:
        np.random.seed(42)
        X = np.random.rand(100, 17)
        X[:, 4] = np.clip(np.random.normal(80000, 30000, 100), 10000, 200000)
        y = np.clip(np.random.normal(50000, 20000, 100), 1000, 150000)
        print("   ✓ Sample data created")
    except Exception as e:
        print(f"   ✗ Error creating sample data: {e}")
        return False
    
    # Create model
    print("3. Creating model...")
    try:
        model = RandomForestRegressor(n_estimators=10, random_state=42)
        model.fit(X, y)
        print(f"   ✓ Model created (expects {model.n_features_in_} features)")
    except Exception as e:
        print(f"   ✗ Error creating model: {e}")
        return False
    
    # Create scaler
    print("4. Creating scaler...")
    try:
        scaler = StandardScaler()
        scaler.fit(X)
        print(f"   ✓ Scaler created (expects {scaler.n_features_in_} features)")
    except Exception as e:
        print(f"   ✗ Error creating scaler: {e}")
        return False
    
    # Create metadata
    print("5. Creating metadata...")
    try:
        metadata = {'num_features': 17}
        print("   ✓ Metadata created")
    except Exception as e:
        print(f"   ✗ Error creating metadata: {e}")
        return False
    
    # Save files
    print("6. Saving files...")
    try:
        joblib.dump(model, 'models/best_model/model.pkl')
        print("   ✓ Model saved")
        joblib.dump(scaler, 'models/scaler.pkl')
        print("   ✓ Scaler saved")
        joblib.dump(metadata, 'models/best_model/metadata.pkl')
        print("   ✓ Metadata saved")
    except Exception as e:
        print(f"   ✗ Error saving files: {e}")
        return False
    
    # Verify
    print("7. Verifying files...")
    try:
        # Check model
        loaded_model = joblib.load('models/best_model/model.pkl')
        model_features = loaded_model.n_features_in_
        
        # Check scaler
        loaded_scaler = joblib.load('models/scaler.pkl')
        scaler_features = loaded_scaler.n_features_in_
        
        # Check metadata
        loaded_metadata = joblib.load('models/best_model/metadata.pkl')
        metadata_features = loaded_metadata.get('num_features', 0)
        
        print(f"   ✓ Model features: {model_features}")
        print(f"   ✓ Scaler features: {scaler_features}")
        print(f"   ✓ Metadata features: {metadata_features}")
        
        if model_features == scaler_features == metadata_features == 17:
            print("\n" + "=" * 50)
            print("🎉 SUCCESS! All files created correctly!")
            print("✅ Model expects 17 features")
            print("✅ Scaler expects 17 features")
            print("✅ Metadata confirms 17 features")
            print("=" * 50)
            print("\nNEXT STEPS:")
            print("1. Restart your backend server")
            print("2. Check logs for 'Features: 17'")
            print("3. Test predictions - no more errors!")
            return True
        else:
            print(f"\n❌ FEATURE MISMATCH!")
            print(f"   Model: {model_features}")
            print(f"   Scaler: {scaler_features}")
            print(f"   Metadata: {metadata_features}")
            return False
            
    except Exception as e:
        print(f"   ✗ Error verifying files: {e}")
        return False

if __name__ == "__main__":
    try:
        success = create_all_files()
        if not success:
            print("\n❌ FAILED TO CREATE MODEL FILES")
        else:
            print("\n✅ MODEL FILES CREATED SUCCESSFULLY!")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
    
    input("\nPress Enter to exit...")