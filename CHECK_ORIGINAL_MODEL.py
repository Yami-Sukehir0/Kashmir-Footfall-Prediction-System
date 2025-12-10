"""
CHECK ORIGINAL MODEL - Verify the original model files and their feature count
"""
import joblib
import os

def check_original_model():
    """Check the original model files"""
    print("=" * 60)
    print("CHECKING ORIGINAL MODEL FILES")
    print("=" * 60)
    print()
    
    # Define paths to original model files
    original_model_path = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model\model.pkl'
    original_scaler_path = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\scaler.pkl'
    original_metadata_path = r'c:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\models\best_model_metadata.pkl'
    
    print("Checking original model files...")
    
    # Check model file
    if os.path.exists(original_model_path):
        try:
            model = joblib.load(original_model_path)
            model_features = model.n_features_in_
            print(f"✅ Model file found: {original_model_path}")
            print(f"   Model expects {model_features} features")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False
    else:
        print(f"❌ Model file not found: {original_model_path}")
        return False
    
    # Check scaler file
    if os.path.exists(original_scaler_path):
        try:
            scaler = joblib.load(original_scaler_path)
            scaler_features = scaler.n_features_in_
            print(f"✅ Scaler file found: {original_scaler_path}")
            print(f"   Scaler expects {scaler_features} features")
        except Exception as e:
            print(f"❌ Error loading scaler: {e}")
            return False
    else:
        print(f"❌ Scaler file not found: {original_scaler_path}")
        return False
    
    # Check metadata file
    if os.path.exists(original_metadata_path):
        try:
            metadata = joblib.load(original_metadata_path)
            if isinstance(metadata, dict):
                metadata_features = metadata.get('num_features', 'Unknown')
                print(f"✅ Metadata file found: {original_metadata_path}")
                print(f"   Metadata specifies {metadata_features} features")
            else:
                print(f"✅ Metadata file found but not in expected format: {original_metadata_path}")
                metadata_features = 'Unknown'
        except Exception as e:
            print(f"❌ Error loading metadata: {e}")
            return False
    else:
        print(f"❌ Metadata file not found: {original_metadata_path}")
        return False
    
    print()
    
    # Check consistency
    print("Checking feature count consistency...")
    if model_features == scaler_features:
        if metadata_features == 'Unknown' or metadata_features == model_features:
            print(f"✅ CONSISTENCY CHECK PASSED!")
            print(f"   All components expect {model_features} features")
            
            # Check if it's 17 or 22 features
            if model_features == 17:
                print("✅ PERFECT! Original model expects exactly 17 features")
                return True, 17
            elif model_features == 22:
                print("⚠️  Original model expects 22 features (may need retraining)")
                return True, 22
            else:
                print(f"⚠️  Original model expects {model_features} features (unexpected)")
                return True, model_features
        else:
            print(f"❌ INCONSISTENCY: Model({model_features}) != Metadata({metadata_features})")
            return False, None
    else:
        print(f"❌ INCONSISTENCY: Model({model_features}) != Scaler({scaler_features})")
        return False, None

if __name__ == "__main__":
    try:
        success, feature_count = check_original_model()
        if success:
            print(f"\n🎉 Original model files are valid and expect {feature_count} features")
        else:
            print(f"\n❌ Original model files have issues")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
    
    input("\nPress Enter to exit...")