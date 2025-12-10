"""
USE ORIGINAL MODEL - Copy original model files to backend directory
"""
import os
import shutil
import joblib

def use_original_model():
    """Copy original model files to backend directory"""
    print("=" * 60)
    print("USING ORIGINAL MODEL FILES")
    print("=" * 60)
    print()
    
    # Define paths
    original_root = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack'
    backend_root = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend'
    
    original_model_path = os.path.join(original_root, 'models', 'best_model', 'model.pkl')
    original_scaler_path = os.path.join(original_root, 'models', 'scaler.pkl')
    original_metadata_path = os.path.join(original_root, 'models', 'best_model_metadata.pkl')
    
    backend_model_dir = os.path.join(backend_root, 'models', 'best_model')
    backend_model_path = os.path.join(backend_model_dir, 'model.pkl')
    backend_scaler_path = os.path.join(backend_root, 'models', 'scaler.pkl')
    backend_metadata_path = os.path.join(backend_root, 'models', 'best_model_metadata.pkl')
    
    print("Source files:")
    print(f"  Model: {original_model_path}")
    print(f"  Scaler: {original_scaler_path}")
    print(f"  Metadata: {original_metadata_path}")
    print()
    
    print("Destination files:")
    print(f"  Model: {backend_model_path}")
    print(f"  Scaler: {backend_scaler_path}")
    print(f"  Metadata: {backend_metadata_path}")
    print()
    
    # Check if original files exist
    missing_files = []
    for path, name in [(original_model_path, "Model"), (original_scaler_path, "Scaler"), (original_metadata_path, "Metadata")]:
        if not os.path.exists(path):
            missing_files.append(f"{name}: {path}")
    
    if missing_files:
        print("❌ MISSING ORIGINAL FILES:")
        for file in missing_files:
            print(f"  {file}")
        return False
    
    print("✅ All original files found")
    print()
    
    # Create backend directories if they don't exist
    print("Creating backend directories...")
    try:
        os.makedirs(backend_model_dir, exist_ok=True)
        print("  ✅ Backend model directory created/verified")
    except Exception as e:
        print(f"  ❌ Error creating backend directories: {e}")
        return False
    
    # Copy files
    print("Copying files to backend directory...")
    try:
        # Copy model
        shutil.copy2(original_model_path, backend_model_path)
        print("  ✅ Model copied successfully")
        
        # Copy scaler
        shutil.copy2(original_scaler_path, backend_scaler_path)
        print("  ✅ Scaler copied successfully")
        
        # Copy metadata
        shutil.copy2(original_metadata_path, backend_metadata_path)
        print("  ✅ Metadata copied successfully")
    except Exception as e:
        print(f"  ❌ Error copying files: {e}")
        return False
    
    print()
    
    # Verify copied files and check feature count
    print("Verifying copied files...")
    try:
        # Check model
        model = joblib.load(backend_model_path)
        model_features = model.n_features_in_
        print(f"  ✅ Model loaded - expects {model_features} features")
        
        # Check scaler
        scaler = joblib.load(backend_scaler_path)
        scaler_features = scaler.n_features_in_
        print(f"  ✅ Scaler loaded - expects {scaler_features} features")
        
        # Check metadata
        metadata = joblib.load(backend_metadata_path)
        if isinstance(metadata, dict):
            metadata_features = metadata.get('num_features', 'Unknown')
            print(f"  ✅ Metadata loaded - specifies {metadata_features} features")
        else:
            print(f"  ✅ Metadata loaded - format unknown")
            metadata_features = 'Unknown'
        
        print()
        
        # Check consistency
        if model_features == scaler_features and (metadata_features == 'Unknown' or metadata_features == model_features):
            print("✅ CONSISTENCY CHECK PASSED!")
            print(f"   All components expect {model_features} features")
            
            if model_features == 17:
                print("🎉 PERFECT! Model expects exactly 17 features as required!")
                success = True
            elif model_features == 22:
                print("⚠️  WARNING: Model expects 22 features, not 17!")
                print("   This may still cause the feature mismatch error.")
                success = False
            else:
                print(f"⚠️  WARNING: Model expects {model_features} features (unexpected count)")
                success = False
        else:
            print("❌ CONSISTENCY CHECK FAILED!")
            print(f"   Model: {model_features}, Scaler: {scaler_features}, Metadata: {metadata_features}")
            success = False
            
    except Exception as e:
        print(f"❌ Error verifying copied files: {e}")
        success = False
    
    print()
    if success:
        print("=" * 60)
        print("🎉 SUCCESS! Original model files copied and verified!")
        print("=" * 60)
        print()
        print("✅ SUMMARY:")
        print("   • Original model files copied to backend directory")
        print("   • All components expect 17 features")
        print("   • Files in correct locations for app.py")
        print()
        print("🚀 NEXT STEPS:")
        print("   1. Restart your backend server: python app.py")
        print("   2. Check logs - should show 'Features: 17'")
        print("   3. Test predictions - no more feature mismatch errors")
        print()
        print("🧹 OPTIONAL CLEANUP:")
        print("   You can now remove the root 'models' directory if desired")
        print("=" * 60)
    else:
        print("=" * 60)
        print("❌ ISSUE DETECTED!")
        print("=" * 60)
        print("The original model still expects 22 features, not 17.")
        print("We need to either:")
        print("1. Retrain the model to expect 17 features, or")
        print("2. Modify the feature preparation to create 22 features")
        print("=" * 60)
    
    return success

if __name__ == "__main__":
    try:
        success = use_original_model()
        if success:
            print("\n✅ ORIGINAL MODEL FILES COPIED SUCCESSFULLY!")
        else:
            print("\n❌ ISSUE WITH ORIGINAL MODEL FILES")
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
    
    input("\nPress Enter to exit...")