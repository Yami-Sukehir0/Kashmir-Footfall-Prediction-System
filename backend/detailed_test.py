"""
Detailed test to verify the model predictions and inverse transformation
"""
import joblib
import numpy as np
import os

def test_detailed_predictions():
    """Test detailed predictions with proper inverse transformation"""
    print("=== DETAILED PREDICTION TEST ===")
    
    try:
        # Load model components
        model = joblib.load('models/best_model/model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        
        print(f"Model type: {type(model).__name__}")
        print(f"Number of features: {model.n_features_in_}")
        
        # Test data for Gulmarg in January 2026
        # Using the same feature preparation logic as in app.py
        features = np.array([
            3,      # location_encoded (Gulmarg)
            2026,   # year
            1,      # month
            1,      # season (winter)
            70000,  # footfall_rolling_avg
            -2,     # temperature_2m_mean
            3,      # temperature_2m_max
            -7,     # temperature_2m_min
            150,    # precipitation_sum
            120,    # sunshine_duration
            -240,   # temp_sunshine_interaction (-2 * 120)
            10,     # temperature_range (3 - (-7))
            -300,   # precipitation_temperature (150 * -2)
            3,      # holiday_count
            1,      # long_weekend_count
            1,      # national_holiday_count
            2       # festival_holiday_count
        ]).reshape(1, -1)
        
        print(f"Input features: {features.flatten()}")
        
        # Scale features
        scaled_features = scaler.transform(features)
        print(f"Scaled features shape: {scaled_features.shape}")
        
        # Make prediction (this should be a log value)
        log_prediction = model.predict(scaled_features)[0]
        print(f"Log-transformed prediction: {log_prediction}")
        
        # Apply inverse transformation (exponentiate)
        actual_prediction = np.exp(log_prediction)
        print(f"Inverse transformed prediction: {actual_prediction}")
        print(f"Rounded prediction: {int(round(actual_prediction)):,} visitors")
        
        # Compare with different locations
        print("\n--- LOCATION COMPARISON ---")
        locations = [
            (1, "Aharbal"),
            (2, "Doodpathri"), 
            (3, "Gulmarg"),
            (4, "Gurez"),
            (5, "Kokernag"),
            (6, "Lolab"),
            (7, "Manasbal"),
            (8, "Pahalgam"),
            (9, "Sonamarg"),
            (10, "Yousmarg")
        ]
        
        predictions = {}
        for loc_code, loc_name in locations:
            test_features = features.copy()
            test_features[0, 0] = loc_code  # Change location
            
            scaled_test = scaler.transform(test_features)
            log_pred = model.predict(scaled_test)[0]
            actual_pred = np.exp(log_pred)
            predictions[loc_name] = actual_pred
            print(f"{loc_name:12}: {int(round(actual_pred)):,} visitors")
        
        # Show the range
        min_pred = min(predictions.values())
        max_pred = max(predictions.values())
        pred_range = max_pred - min_pred
        print(f"\nPrediction range: {int(round(pred_range)):,} visitors")
        print(f"Highest: {max(predictions, key=predictions.get)} ({int(round(max_pred)):,} visitors)")
        print(f"Lowest: {min(predictions, key=predictions.get)} ({int(round(min_pred)):,} visitors)")
        
        return True, int(round(actual_prediction))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False, 0

if __name__ == "__main__":
    success, prediction = test_detailed_predictions()
    if success:
        print(f"\n✅ Detailed test completed successfully!")
        print(f"Predicted visitors for Gulmarg January 2026: {prediction:,}")
    else:
        print(f"\n❌ Detailed test failed!")