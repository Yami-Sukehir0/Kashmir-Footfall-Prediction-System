#!/usr/bin/env python3
"""
Simple retrain script for Kashmir tourism prediction model
"""

import pandas as pd
import numpy as np
import os
import joblib
import logging
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_training_data(data_path):
    """Load training data"""
    logger.info(f"Loading training data from: {data_path}")
    
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Training data not found: {data_path}")
    
    df = pd.read_csv(data_path)
    logger.info(f"Loaded {len(df)} samples with {len(df.columns)} features")
    
    return df

def prepare_features(df):
    """Prepare features and target for training"""
    logger.info("Preparing features and target...")
    
    # Define feature columns (matching the 17 features used in prediction)
    feature_columns = [
        'location_encoded',           # 1. location_encoded
        'year',                      # 2. year
        'month',                     # 3. month
        'season',                    # 4. season
        'footfall_rolling_avg',      # 5. footfall_rolling_avg
        'temperature_2m_mean',       # 6. temperature_2m_mean
        'temperature_2m_max',        # 7. temperature_2m_max
        'temperature_2m_min',        # 8. temperature_2m_min
        'precipitation_sum',         # 9. precipitation_sum
        'sunshine_duration',         # 10. sunshine_duration
        'temp_sunshine_interaction', # 11. temp_sunshine_interaction
        'temperature_range',         # 12. temperature_range
        'precipitation_temperature', # 13. precipitation_temperature
        'holiday_count',             # 14. holiday_count
        'long_weekend_count',        # 15. long_weekend_count
        'national_holiday_count',    # 16. national_holiday_count
        'festival_holiday_count'     # 17. festival_holiday_count
    ]
    
    # Target
    y = df['Footfall'].copy()
    
    # Features
    X = df[feature_columns].copy()
    
    logger.info(f"Features shape: {X.shape}")
    logger.info(f"Target shape: {y.shape}")
    
    return X, y

def split_data(X, y, test_size=0.2):
    """Split data into train and test sets"""
    logger.info("Splitting data...")
    
    # Sort by year and month to ensure temporal ordering
    temp_df = pd.DataFrame({'year': X['year'], 'month': X['month']})
    sort_idx = temp_df.sort_values(['year', 'month']).index
    
    X_sorted = X.iloc[sort_idx].reset_index(drop=True)
    y_sorted = y.iloc[sort_idx].reset_index(drop=True)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_sorted, y_sorted, test_size=test_size, random_state=42
    )
    
    logger.info(f"Train set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    return X_train, X_test, y_train, y_test

def scale_features(X_train, X_test):
    """Scale features using StandardScaler"""
    logger.info("Scaling features...")
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    logger.info("Feature scaling complete")
    
    return scaler, X_train_scaled, X_test_scaled

def train_model(X_train, y_train):
    """Train RandomForest model with optimized parameters for location sensitivity"""
    logger.info("Training RandomForest model...")
    
    # Create model with parameters that emphasize location sensitivity
    model = RandomForestRegressor(
        n_estimators=200,           # More trees for better performance
        max_depth=15,               # Deeper trees to capture complex patterns
        min_samples_split=5,        # Fewer samples needed to split
        min_samples_leaf=2,         # Fewer samples per leaf
        max_features='sqrt',        # Use square root of features
        random_state=42,
        n_jobs=-1
    )
    
    # Fit model
    model.fit(X_train, y_train)
    logger.info("Model training complete")
    
    return model

def evaluate_model(model, X_test, y_test):
    """Evaluate model on test set"""
    logger.info("Evaluating model on test set...")
    
    # Predict
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    test_r2 = r2_score(y_test, y_pred)
    test_mae = mean_absolute_error(y_test, y_pred)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    logger.info(f"Test R2: {test_r2:.4f}")
    logger.info(f"Test MAE: {test_mae:.2f}")
    logger.info(f"Test RMSE: {test_rmse:.2f}")
    
    return {
        'R2': test_r2,
        'MAE': test_mae,
        'RMSE': test_rmse
    }

def check_location_sensitivity(model, scaler, feature_columns):
    """Check if model is sensitive to location changes"""
    logger.info("Checking location sensitivity...")
    
    # Create test data with different locations but same other features
    base_data = np.array([
        5,      # location_encoded (middle value)
        2025,   # year
        6,      # month
        3,      # season (summer)
        50000,  # footfall_rolling_avg
        22,     # temperature_2m_mean
        27,     # temperature_2m_max
        17,     # temperature_2m_min
        45,     # precipitation_sum
        280,    # sunshine_duration
        6160,   # temp_sunshine_interaction
        10,     # temperature_range
        990,    # precipitation_temperature
        2,      # holiday_count
        1,      # long_weekend_count
        0,      # national_holiday_count
        2       # festival_holiday_count
    ]).reshape(1, -1)
    
    # Test predictions for different locations
    predictions = {}
    for loc_code in range(1, 11):  # Location codes 1-10
        test_data = base_data.copy()
        test_data[0, 0] = loc_code  # Change location code
        
        # Scale features
        scaled_data = scaler.transform(test_data)
        
        # Predict
        pred = model.predict(scaled_data)[0]
        predictions[loc_code] = pred
    
    # Check diversity
    unique_predictions = len(set([round(p) for p in predictions.values()]))
    prediction_range = max(predictions.values()) - min(predictions.values())
    
    logger.info(f"Unique predictions for 10 locations: {unique_predictions}/10")
    logger.info(f"Prediction range: {prediction_range:.0f} visitors")
    
    # Display all predictions
    logger.info("Predictions by location:")
    for loc_code, pred in predictions.items():
        logger.info(f"  Location {loc_code}: {pred:.0f} visitors")
    
    if unique_predictions >= 8 and prediction_range > 5000:
        logger.info("✅ Model shows good location sensitivity")
        return True
    else:
        logger.warning("⚠️ Model shows poor location sensitivity")
        return False

def save_model(model, scaler, test_metrics, feature_columns, model_dir='models'):
    """Save model, scaler, and metadata"""
    logger.info("Saving model artifacts...")
    
    # Create directories
    os.makedirs(model_dir, exist_ok=True)
    best_model_dir = os.path.join(model_dir, 'best_model')
    os.makedirs(best_model_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(best_model_dir, 'model.pkl')
    joblib.dump(model, model_path)
    logger.info(f"Model saved: {model_path}")
    
    # Save scaler
    scaler_path = os.path.join(model_dir, 'scaler.pkl')
    joblib.dump(scaler, scaler_path)
    logger.info(f"Scaler saved: {scaler_path}")
    
    # Save metadata
    metadata = {
        'feature_names': feature_columns,
        'model_type': 'randomforestregressor',
        'num_features': len(feature_columns),
        'trained_at': datetime.now().isoformat(),
        'test_metrics': test_metrics
    }
    
    metadata_path = os.path.join(best_model_dir, 'metadata.pkl')
    joblib.dump(metadata, metadata_path)
    logger.info(f"Metadata saved: {metadata_path}")

def display_feature_importance(model, feature_columns):
    """Display feature importances"""
    logger.info("\nFeature Importances:")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for i, row in feature_importance.head(10).iterrows():
        logger.info(f"  {row['feature']}: {row['importance']:.4f}")

def main():
    """Main training function"""
    logger.info("=" * 70)
    logger.info("KASHMIR TOURISM FOOTFALL PREDICTION - MODEL RETRAINING")
    logger.info("=" * 70)
    
    try:
        # Load training data
        data_path = os.path.join('data', 'model_ready', 'kashmir_tourism_simple_label.csv')
        df = load_training_data(data_path)
        
        # Prepare features
        X, y = prepare_features(df)
        feature_columns = X.columns.tolist()
        
        # Split data
        X_train, X_test, y_train, y_test = split_data(X, y)
        
        # Scale features
        scaler, X_train_scaled, X_test_scaled = scale_features(X_train, X_test)
        
        # Train model
        model = train_model(X_train_scaled, y_train)
        
        # Evaluate model
        test_metrics = evaluate_model(model, X_test_scaled, y_test)
        
        # Check location sensitivity
        location_sensitive = check_location_sensitivity(model, scaler, feature_columns)
        
        # Display feature importances
        display_feature_importance(model, feature_columns)
        
        # Save model if it's location sensitive
        if location_sensitive:
            save_model(model, scaler, test_metrics, feature_columns)
            logger.info("\n✅ Model retraining completed successfully!")
        else:
            logger.warning("\n⚠️ Model shows poor location sensitivity. Consider adjusting training parameters.")
        
        logger.info("\n" + "=" * 70)
        logger.info("TRAINING COMPLETE!")
        logger.info("=" * 70)
        
        return model, scaler, test_metrics
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

if __name__ == '__main__':
    main()