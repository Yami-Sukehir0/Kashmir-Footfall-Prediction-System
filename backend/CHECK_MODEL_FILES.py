"""
CHECK MODEL FILES - Verifies all model files exist and are correct
"""
import os
import joblib

def check_model_files():
    """Check that all model files exist and are correct"""
    print("=" * 60)
    print("CHECKING MODEL FILES")
    print("=" * 60)
    print()
    
    # Define file paths
    files = {
        'Model': 'models/best_model/model.pkl',
        'Scaler': 'models/scaler.pkl',
        'Metadata': 'models/best_model/metadata.pkl'
    }
    
    # Check each file
    all_good = True
    for name, path in files.items():
        print(f"🔍 Checking {name}...")
        
        if os.path.exists(path):
            try:
                # Try to load the file
                obj = joblib.load(path)
                size = os.path.getsize(path)
                print(f"   ✅ {name} found ({size} bytes)")
                
                # Check features for model and scaler
                if name == 'Model' and hasattr(obj, 'n_features_in_'):
                    features = obj.n_features_in_
                    print(f"   🎯 Model expects {features} features")
                    if features == 17:
                        print(f"   ✅ Feature count correct!")
                    else:
                        print(f"   ❌ Feature count wrong! Expected 17, got {features}")
                        all_good = False
                        
                elif name == 'Scaler' and hasattr(obj, 'n_features_in_'):
                    features = obj.n_features_in_
                    print(f"   🎯 Scaler expects {features} features")
                    if features == 17:
                        print(f"   ✅ Feature count correct!")
                    else:
                        print(f"   ❌ Feature count wrong! Expected 17, got {features}")
                        all_good = False
                        
                elif name == 'Metadata' and isinstance(obj, dict):
                    features = obj.get('num_features', 'Unknown')
                    print(f"   🎯 Metadata specifies {features} features")
                    if features == 17:
                        print(f"   ✅ Feature count correct!")
                    elif features == 'Unknown':
                        print(f"   ⚠️  Feature count not specified in metadata")
                    else:
                        print(f"   ❌ Feature count wrong! Expected 17, got {features}")
                        all_good = False
                        
            except Exception as e:
                print(f"   ❌ Error loading {name}: {e}")
                all_good = False
        else:
            print(f"   ❌ {name} not found at {path}")
            all_good = False
        
        print()
    
    # Summary
    print("=" * 60)
    if all_good:
        print("🎉 ALL MODEL FILES ARE CORRECT!")
        print("=" * 60)
        print()
        print("YOUR SYSTEM IS READY:")
        print("✅ All files exist")
        print("✅ All components expect 17 features")
        print("✅ No feature mismatch errors expected")
        print()
        print("NEXT STEPS:")
        print("1. Restart your backend server: python app.py")
        print("2. Check logs for 'Features: 17'")
        print("3. Test predictions - should work perfectly!")
    else:
        print("❌ SOME ISSUES FOUND")
        print("=" * 60)
        print()
        print("Please run CREATE_MODEL_FILES.bat to fix the issues.")
    
    print("=" * 60)

if __name__ == "__main__":
    check_model_files()
    input("\nPress Enter to exit...")