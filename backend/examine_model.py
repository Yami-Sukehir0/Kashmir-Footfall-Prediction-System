"""
Examine the trained model to understand its behavior
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import load_model, model, scaler, prepare_features
import numpy as np
import joblib

def examine_model():
    """Examine the loaded model"""
    print("=== Model Examination ===")
    
    if model is None:
        print("Model not loaded!")
        return
    
    print(f"Model type: {type(model)}")
    print(f"Number of features expected: {model.n_features_in_}")
    
    # Check if model has feature importance
    if hasattr(model, 'feature_importances_'):
        print(f"Feature importances: {model.feature_importances_}")
    
    # Check scaler
    if scaler is not None:
        print(f"Scaler type: {type(scaler)}")
        if hasattr(scaler, 'scale_'):
            print(f"Scaler scale_: {scaler.scale_}")
        if hasattr(scaler, 'mean_'):
            print(f"Scaler mean_: {scaler.mean_}")

def test_individual_predictions():
    """Test predictions with detailed feature examination"""
    print("\n=== Detailed Prediction Test ===")
    
    locations = ["Gulmarg", "Pahalgam", "Sonamarg", "Aharbal"]
    year = 2026
    month = 1
    
    for location in locations:
        print(f"\n--- {location} ---")
        features = prepare_features(location, year, month, 80000)
        print(f"Raw features: {features}")
        
        if scaler is not None:
            scaled_features = scaler.transform(features)
            print(f"Scaled features: {scaled_features}")
            
            # Make prediction
            prediction = model.predict(scaled_features)[0]
            print(f"Prediction: {prediction}")
            
            # Try to understand what the model is doing
            # For tree-based models, we can look at decision paths
            if hasattr(model, 'decision_path'):
                try:
                    path = model.decision_path(scaled_features)
                    print(f"Decision path shape: {path.shape}")
                except:
                    pass

def check_for_model_issues():
    """Check for potential issues with the model"""
    print("\n=== Model Issue Check ===")
    
    # Check if all predictions are very close (indicating a potential issue)
    locations = ["Gulmarg", "Pahalgam", "Sonamarg", "Aharbal", "Doodpathri", "Kokernag"]
    year = 2026
    month = 1
    
    predictions = {}
    
    for location in locations:
        features = prepare_features(location, year, month, 80000)
        if scaler is not None:
            scaled_features = scaler.transform(features)
            prediction = model.predict(scaled_features)[0]
            predictions[location] = prediction
            print(f"{location}: {prediction:.2f}")
    
    # Check if predictions are suspiciously close
    values = list(predictions.values())
    min_val = min(values)
    max_val = max(values)
    difference = max_val - min_val
    
    print(f"\nPrediction range: {min_val:.2f} to {max_val:.2f}")
    print(f"Difference: {difference:.2f}")
    
    if difference < 1000:  # Less than 1000 visitors difference
        print("⚠️  WARNING: Very small difference between predictions!")
        print("   This might indicate:")
        print("   - Model is not sensitive to location features")
        print("   - Model was trained on limited data")
        print("   - Model overfitting or underfitting")
    else:
        print("✅ Predictions show reasonable variation")

def examine_training_metadata():
    """Examine the training metadata"""
    print("\n=== Training Metadata ===")
    
    try:
        metadata_path = os.path.join('models', 'best_model_metadata.pkl')
        metadata = joblib.load(metadata_path)
        print(f"Metadata: {metadata}")
    except Exception as e:
        print(f"Could not load metadata: {e}")

if __name__ == "__main__":
    examine_model()
    test_individual_predictions()
    check_for_model_issues()
    examine_training_metadata()