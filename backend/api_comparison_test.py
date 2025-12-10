"""
Test to replicate the exact API call and verify predictions
"""
import joblib
import numpy as np
import os

def test_api_replication():
    """Replicate the exact API call conditions"""
    print("=== API REPLICATION TEST ===")
    
    try:
        # Load model components
        model = joblib.load('models/best_model/model.pkl')
        scaler = joblib.load('models/scaler.pkl')
        
        print(f"Model type: {type(model).__name__}")
        print(f"Number of features: {model.n_features_in_}")
        
        # Replicate the exact features used by the API for Gulmarg Jan 2026 with rolling_avg=80000
        features = np.array([
            3,      # location_encoded (Gulmarg)
            2026,   # year
            1,      # month
            1,      # season (winter)
            80000,  # footfall_rolling_avg (as used by API)
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
        
        # Compare with the API result
        api_result = 26204
        difference = abs(actual_prediction - api_result)
        print(f"\nAPI reported: {api_result:,} visitors")
        print(f"Our calculation: {int(round(actual_prediction)):,} visitors")
        print(f"Difference: {int(difference):,} visitors ({(difference/api_result)*100:.2f}%)")
        
        # Test December prediction for comparison (should be higher for ski resort)
        print("\n--- DECEMBER COMPARISON (Gulmarg) ---")
        dec_features = features.copy()
        dec_features[0, 2] = 12  # month = December
        dec_features[0, 3] = 1   # season = winter
        
        # Weather for December (from WEATHER_DATA in app.py)
        dec_features[0, 5] = -1   # temp_mean
        dec_features[0, 6] = 4    # temp_max
        dec_features[0, 7] = -6   # temp_min
        dec_features[0, 8] = 140  # precipitation
        dec_features[0, 9] = 130  # sunshine
        dec_features[0, 10] = -130 # temp_sunshine_interaction (-1 * 130)
        dec_features[0, 11] = 10   # temperature_range (4 - (-6))
        dec_features[0, 12] = -140 # precipitation_temperature (140 * -1)
        
        scaled_dec = scaler.transform(dec_features)
        log_dec_pred = model.predict(scaled_dec)[0]
        dec_actual = np.exp(log_dec_pred)
        print(f"December prediction: {int(round(dec_actual)):,} visitors")
        print(f"January prediction: {int(round(actual_prediction)):,} visitors")
        print(f"Winter season comparison: December vs January")
        
        return True, int(round(actual_prediction))
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False, 0

if __name__ == "__main__":
    success, prediction = test_api_replication()
    if success:
        print(f"\n✅ API replication test completed successfully!")
        print(f"Predicted visitors for Gulmarg January 2026: {prediction:,}")
    else:
        print(f"\n❌ API replication test failed!")