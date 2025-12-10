"""
CHECK CURRENT STATE - See what model files currently exist
"""
import os
import joblib

def check_current_state():
    """Check what model files currently exist"""
    print("CURRENT STATE CHECK")
    print("=" * 50)
    
    # Check directories
    print("Directories:")
    dirs = ['models', 'models/best_model']
    for directory in dirs:
        if os.path.exists(directory):
            if os.path.isdir(directory):
                files = os.listdir(directory)
                print(f"  ✓ {directory}/ ({len(files)} items)")
                for file in files:
                    print(f"    - {file}")
            else:
                print(f"  ? {directory} (exists but not a directory)")
        else:
            print(f"  ✗ {directory} (missing)")
    
    print()
    
    # Check specific files
    print("Required Files:")
    required_files = [
        'models/best_model/model.pkl',
        'models/scaler.pkl', 
        'models/best_model/metadata.pkl'
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"  ✓ {file_path} ({size} bytes)")
            
            # Try to load and check features
            try:
                obj = joblib.load(file_path)
                if hasattr(obj, 'n_features_in_'):
                    print(f"    → Expects {obj.n_features_in_} features")
                elif isinstance(obj, dict) and 'num_features' in obj:
                    print(f"    → Specifies {obj['num_features']} features")
            except Exception as e:
                print(f"    → Error loading: {e}")
        else:
            print(f"  ✗ {file_path} (MISSING)")
    
    print()
    
    # Summary
    existing_files = [f for f in required_files if os.path.exists(f)]
    print(f"Summary: {len(existing_files)}/{len(required_files)} required files exist")
    
    if len(existing_files) == len(required_files):
        print("✅ All required files present")
    else:
        print("❌ Some files missing - run CREATE_ALL_NOW.bat")

if __name__ == "__main__":
    check_current_state()
    input("\nPress Enter to exit...")