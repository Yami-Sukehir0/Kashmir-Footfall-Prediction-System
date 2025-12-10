#!/usr/bin/env python3
"""
Retrain the Kashmir tourism prediction model with improved location sensitivity using log-transformed data
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
from sklearn.model_selection import GridSearchCV
import warnings
warnings.filterwarnings('ignore')

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
    # These are the features that the prediction pipeline expects
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
    
    # Target (log-transformed footfall)
    y = df['Footfall'].copy()
    
    # Features (select only the features that match what the prediction pipeline expects)
    X = df[feature_columns].copy()
    
    logger.info(f"Features shape: {X.shape}")
    logger.info(f"Target shape: {y.shape}")
    
    return X, y

def split_data(X, y, test_size=0.2, val_size=0.1):
    """Split data into train, validation, and test sets"""
    logger.info("Splitting data...")
    
    # Sort by year and month to ensure temporal ordering
    # This is important for time series data to avoid data leakage
    temp_df = pd.DataFrame({'year': X['year'], 'month': X['month']})
    sort_idx = temp_df.sort_values(['year', 'month']).index
    
    X_sorted = X.iloc[sort_idx].reset_index(drop=True)
    y_sorted = y.iloc[sort_idx].reset_index(drop=True)
    
    # Calculate split indices
    n = len(X_sorted)
    test_idx = int(n * (1 - test_size))
    val_idx = int(test_idx * (1 - val_size))
    
    # Split
    X_train = X_sorted.iloc[:val_idx]
    y_train = y_sorted.iloc[:val_idx]
    
    X_val = X_sorted.iloc[val_idx:test_idx]
    y_val = y_sorted.iloc[val_idx:test_idx]
    
    X_test = X_sorted.iloc[test_idx:]
    y_test = y_sorted.iloc[test_idx:]
    
    logger.info(f"Train set: {len(X_train)} samples")
    logger.info(f"Validation set: {len(X_val)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    
    return X_train, X_val, X_test, y_train, y_val, y_test

def scale_features(X_train, X_val, X_test):
    """Scale features using StandardScaler"""
    logger.info("Scaling features...")
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)
    
    logger.info("Feature scaling complete")
    
    return scaler, X_train_scaled, X_val_scaled, X_test_scaled

def train_model(X_train, y_train, X_val, y_val):
    """Train RandomForest model with hyperparameter tuning"""
    logger.info("Training RandomForest model with hyperparameter tuning...")
    
    # Enhanced parameters for better sensitivity to seasonal/location factors
    param_grid = {
        'n_estimators': [300],  # Increased for better performance
        'max_depth': [25],      # Increased depth for capturing complex patterns
        'min_samples_split': [2],
        'min_samples_leaf': [1],
        'max_features': ['sqrt'],
        'random_state': [42]
    }
    
    # Create base model
    rf = RandomForestRegressor(n_jobs=-1)
    
    # Perform grid search with cross-validation
    logger.info("Performing grid search...")
    grid_search = GridSearchCV(
        estimator=rf,
        param_grid=param_grid,
        cv=3,  # Reduced CV folds for faster training
        scoring='r2',
        n_jobs=-1,
        verbose=1
    )
    
    # Fit grid search
    grid_search.fit(X_train, y_train)
    
    # Get best model
    best_model = grid_search.best_estimator_
    
    # Evaluate on validation set
    val_pred = best_model.predict(X_val)
    val_r2 = r2_score(y_val, val_pred)
    val_mae = mean_absolute_error(y_val, val_pred)
    val_rmse = np.sqrt(mean_squared_error(y_val, val_pred))
    
    logger.info(f"Best parameters: {grid_search.best_params_}")
    logger.info(f"Validation R2: {val_r2:.4f}")
    logger.info(f"Validation MAE: {val_mae:.2f}")
    logger.info(f"Validation RMSE: {val_rmse:.2f}")
    
    return best_model, grid_search.best_params_

def evaluate_model(model, X_test, y_test):
    """Evaluate model on test set"""
    logger.info("Evaluating model on test set...")
    
    # Predict (log-transformed values)
    y_pred_log = model.predict(X_test)
    
    # Calculate metrics on log-transformed values
    test_r2 = r2_score(y_test, y_pred_log)
    test_mae = mean_absolute_error(y_test, y_pred_log)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_log))
    
    logger.info(f"Test R2 (log scale): {test_r2:.4f}")
    logger.info(f"Test MAE (log scale): {test_mae:.4f}")
    logger.info(f"Test RMSE (log scale): {test_rmse:.4f}")
    
    # Also calculate metrics on actual values (inverse transformed)
    y_test_actual = np.exp(y_test)
    y_pred_actual = np.exp(y_pred_log)
    
    test_r2_actual = r2_score(y_test_actual, y_pred_actual)
    test_mae_actual = mean_absolute_error(y_test_actual, y_pred_actual)
    test_rmse_actual = np.sqrt(mean_squared_error(y_test_actual, y_pred_actual))
    
    logger.info(f"Test R2 (actual scale): {test_r2_actual:.4f}")
    logger.info(f"Test MAE (actual scale): {test_mae_actual:.2f}")
    logger.info(f"Test RMSE (actual scale): {test_rmse_actual:.2f}")
    
    return {
        'R2': test_r2,
        'MAE': test_mae,
        'RMSE': test_rmse,
        'R2_actual': test_r2_actual,
        'MAE_actual': test_mae_actual,
        'RMSE_actual': test_rmse_actual
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
        
        # Predict (log-transformed value)
        pred_log = model.predict(scaled_data)[0]
        # Convert to actual value
        pred_actual = np.exp(pred_log)
        predictions[loc_code] = pred_actual
    
    # Check diversity in actual predictions
    unique_predictions = len(set([round(p, -3) for p in predictions.values()]))  # Round to nearest 1000
    prediction_range = max(predictions.values()) - min(predictions.values())
    
    logger.info(f"Unique actual predictions for 10 locations: {unique_predictions}/10")
    logger.info(f"Actual prediction range: {prediction_range:.0f}")
    
    # Check if peak winter predictions for Gulmarg are in lakhs range
    gulmarg_winter_data = base_data.copy()
    gulmarg_winter_data[0, 0] = 3  # Gulmarg
    gulmarg_winter_data[0, 2] = 1  # January
    gulmarg_winter_data[0, 3] = 1  # Winter season
    
    scaled_gulmarg = scaler.transform(gulmarg_winter_data)
    gulmarg_pred_log = model.predict(scaled_gulmarg)[0]
    gulmarg_pred_actual = np.exp(gulmarg_pred_log)
    
    logger.info(f"Gulmarg January prediction: {gulmarg_pred_actual:.0f} visitors")
    
    if gulmarg_pred_actual >= 100000:
        logger.info("✅ Gulmarg peak winter prediction is in LAKHS range")
    else:
        logger.warning("⚠️ Gulmarg peak winter prediction is NOT in LAKHS range")
    
    if unique_predictions >= 8 and prediction_range > 10000:
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
        'test_metrics': test_metrics,
        'target_transform': 'log',  # Indicate that target is log-transformed
    }
    
    metadata_path = os.path.join(best_model_dir, 'metadata.pkl')
    joblib.dump(metadata, metadata_path)
    logger.info(f"Metadata saved: {metadata_path}")

def main():
    """Main training function"""
    logger.info("=" * 70)
    logger.info("KASHMIR TOURISM FOOTFALL PREDICTION - MODEL RETRAINING")
    logger.info("Using LOG-TRANSFORMED dataset for improved model performance")
    logger.info("=" * 70)
    
    try:
        # Load training data (using log-transformed dataset with full path)
        data_path = r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\data\kashmir_tourism_LOG_TRANSFORMED_option2.csv'
        df = load_training_data(data_path)
        
        # Prepare features
        X, y = prepare_features(df)
        feature_columns = X.columns.tolist()
        
        # Split data
        X_train, X_val, X_test, y_train, y_val, y_test = split_data(X, y)
        
        # Scale features
        scaler, X_train_scaled, X_val_scaled, X_test_scaled = scale_features(
            X_train, X_val, X_test
        )
        
        # Train model
        model, best_params = train_model(X_train_scaled, y_train, X_val_scaled, y_val)
        
        # Evaluate model
        test_metrics = evaluate_model(model, X_test_scaled, y_test)
        
        # Check location sensitivity
        location_sensitive = check_location_sensitivity(model, scaler, feature_columns)
        
        # Save model regardless for testing purposes
        save_model(model, scaler, test_metrics, feature_columns)
        if location_sensitive:
            logger.info("\n✅ Model retraining completed successfully!")
            logger.info("Model trained on LOG-TRANSFORMED data for better performance")
        else:
            logger.warning("\n⚠️ Model shows poor location sensitivity. Consider adjusting training parameters.")
            logger.info("Model saved for testing purposes.")
        
        # Display feature importances
        feature_importance = pd.DataFrame({
            'feature': feature_columns,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        logger.info("\nTop 5 Most Important Features:")
        for i, row in feature_importance.head().iterrows():
            logger.info(f"  {row['feature']}: {row['importance']:.4f}")
        
        logger.info("\n" + "=" * 70)
        logger.info("TRAINING COMPLETE!")
        logger.info("=" * 70)
        
        return model, scaler, test_metrics
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        raise

if __name__ == '__main__':
    main()