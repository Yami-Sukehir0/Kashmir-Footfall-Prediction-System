"""
Diagnosis script to identify the exact source of the feature mismatch
"""
import joblib
import numpy as np
import os

def diagnose_scaler():
    """Diagnose scaler issues"""
    print("DIAGNOSING SCALER ISSUE")
    print("=" * 40)
    
    # Check all possible scaler locations
    scaler_paths = [
        'models/scaler.pkl',
        'scaler.pkl',
        'models/best_model/scaler.pkl',
        '../models/scaler.pkl'
    ]
    
    scalers_found = []
    
    for path in scaler_paths:
        if os.path.exists(path):
            try:
                scaler = joblib.load(path)
                scalers_found.append((path, scaler))
                print(f"✓ Found scaler at: {path}")
                print(f"  Features expected: {scaler.n_features_in_}")
                
                # Safely get mean shape
                mean_shape = "N/A"
                if hasattr(scaler, 'mean_') and scaler.mean_ is not None:
                    if hasattr(scaler.mean_, 'shape'):
                        mean_shape = scaler.mean_.shape
                print(f"  Mean shape: {mean_shape}")
                
                # Safely get scale shape
                scale_shape = "N/A"
                if hasattr(scaler, 'scale_') and scaler.scale_ is not None:
                    if hasattr(scaler.scale_, 'shape'):
                        scale_shape = scaler.scale_.shape
                print(f"  Scale shape: {scale_shape}")
                print()
            except Exception as e:
                print(f"✗ Error loading scaler from {path}: {e}")
                print()
    
    if not scalers_found:
        print("⚠ No scaler files found!")
        return None
    
    return scalers_found

def diagnose_model():
    """Diagnose model issues"""
    print("DIAGNOSING MODEL")
    print("=" * 40)
    
    model_paths = [
        'models/best_model/model.pkl',
        'models/model.pkl',
        'model.pkl',
        '../models/best_model/model.pkl'
    ]
    
    models_found = []
    
    for path in model_paths:
        if os.path.exists(path):
            try:
                model = joblib.load(path)
                models_found.append((path, model))
                print(f"✓ Found model at: {path}")
                print(f"  Model type: {type(model).__name__}")
                if hasattr(model, 'n_features_in_'):
                    print(f"  Features expected: {model.n_features_in_}")
                print()
            except Exception as e:
                print(f"✗ Error loading model from {path}: {e}")
                print()
    
    if not models_found:
        print("⚠ No model files found!")
        return None
    
    return models_found

def test_actual_prediction_flow():
    """Test the actual prediction flow that's failing"""
    print("TESTING ACTUAL PREDICTION FLOW")
    print("=" * 40)
    
    try:
        # Load model and scaler
        model = joblib.load('models/best_model/model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        
        print(f"Model expects: {model.n_features_in_} features")
        print(f"Scaler expects: {scaler.n_features_in_} features")
        
        # Create the exact features that cause the error
        # Based on the error, this should be 17 features
        features_17 = np.array([
            3,      # location
            2026,   # year
            1,      # month
            1,      # season
            70000,  # rolling_avg
            -2,     # temp_mean
            3,      # temp_max
            -7,     # temp_min
            150,    # precipitation
            120,    # sunshine
            -240,   # temp_sunshine_interaction
            10,     # temp_range
            -300,   # precip_temp
            3,      # holiday_count
            1,      # long_weekend_count
            1,      # national_holiday_count
            2       # festival_holiday_count
        ]).reshape(1, -1)
        
        print(f"Input features shape: {features_17.shape}")
        
        # Try to scale (this is where the error occurs)
        try:
            scaled_features = scaler.transform(features_17)
            print(f"✓ Scaling successful - output shape: {scaled_features.shape}")
            
            # Try prediction
            try:
                prediction = model.predict(scaled_features)
                print(f"✓ Prediction successful: {prediction[0]}")
                return True
            except Exception as e:
                print(f"✗ Prediction failed: {e}")
                return False
                
        except Exception as e:
            print(f"✗ Scaling failed: {e}")
            print(f"Scaler expected shape: {scaler.n_features_in_}")
            print(f"Input shape: {features_17.shape[1]}")
            return False
            
    except Exception as e:
        print(f"✗ Failed to load model/scaler: {e}")
        return False

def main():
    """Main diagnosis function"""
    print("KASHMIR TOURISM MODEL DIAGNOSIS")
    print("=" * 50)
    
    # Diagnose scaler
    scalers = diagnose_scaler()
    
    # Diagnose model
    models = diagnose_model()
    
    # Test actual flow
    print()
    flow_success = test_actual_prediction_flow()
    
    print("\n" + "=" * 50)
    if flow_success:
        print("✅ PREDICTION FLOW WORKS CORRECTLY")
        print("The issue might be elsewhere in the application")
    else:
        print("❌ PREDICTION FLOW HAS ISSUES")
        print("The feature mismatch is confirmed")
    print("=" * 50)

if __name__ == "__main__":
    main()