#!/usr/bin/env python3

"""
Prediction Script
Make predictions using trained models with enhanced dataset
"""

import sys
import os
import yaml
import pandas as pd
import numpy as np
import joblib
import argparse
import logging
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def setup_logging():
    """Setup logging"""
    log_dir = 'logs'
    os.makedirs(log_dir, exist_ok=True)

    log_file = os.path.join(log_dir, f'predict_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')

    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )

    return logging.getLogger(__name__)


def load_model(model_path: str):
    """Load a trained model"""
    return joblib.load(model_path)


def load_scaler(scaler_path: str):
    """Load a fitted scaler"""
    if os.path.exists(scaler_path):
        return joblib.load(scaler_path)
    return None


def inverse_transform_predictions(predictions: np.ndarray) -> np.ndarray:
    """Convert log-scale predictions back to actual values"""
    return np.expm1(predictions)  # e^x - 1


def predict(model_name: str = 'best_model', input_csv: str = None):
    """
    Make predictions using a trained model

    Args:
        model_name: Name of the model to use
        input_csv: Path to input CSV (if None, uses test set from enhanced dataset)
    """
    logger = setup_logging()

    logger.info("=" * 70)
    logger.info("KASHMIR TOURISM PREDICTION - INFERENCE")
    logger.info("=" * 70)

    # Load config
    with open('config/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    # Load model
    if model_name == 'best_model':
        model_path = os.path.join(config['modeling']['model_dir'], 'best_model', 'model.pkl')
    else:
        model_path = os.path.join(config['modeling']['model_dir'], f'{model_name}_model.pkl')

    logger.info(f"Loading model from: {model_path}")
    model = load_model(model_path)

    # Load scaler if exists
    scaler_path = os.path.join(config['modeling']['model_dir'], 'scaler.pkl')
    scaler = load_scaler(scaler_path)

    if scaler:
        logger.info("Scaler loaded")

    # Load data
    if input_csv:
        logger.info(f"Loading data from: {input_csv}")
        df = pd.read_csv(input_csv)
    else:
        # Use ENHANCED dataset (same as training)
        enhanced_dataset = 'kashmir_tourism_26columns_LOG_TRANSFORMED.csv'
        data_path = os.path.join(
            config['paths']['model_ready'],
            enhanced_dataset
        )

        logger.info(f"Loading test data from enhanced dataset: {enhanced_dataset}")

        if not os.path.exists(data_path):
            logger.error(f"Enhanced dataset not found: {data_path}")
            logger.error("Please run the enhanced pipeline first:")
            logger.error("  python pipeline/run_pipeline_enhanced.py --skip-weather")
            return

        df = pd.read_csv(data_path)

        # Use full test set (20% of data = last ~168 samples from 840 total)
        if 'year' in df.columns and 'month' in df.columns:
            df = df.sort_values(['year', 'month'])
            test_size = 0.2
            test_samples = int(len(df) * test_size)
            df = df.tail(test_samples)  # Last 20% of data
            logger.info(f"Using {test_samples} samples (20% of dataset) for prediction")

    # Prepare features (remove metadata columns)
    exclude_features = config['modeling']['exclude_features']
    metadata_cols = ['time', 'Footfall_original', 'location', 'Location',
                     'tourist_site', 'site', 'year', 'month', 'season']

    cols_to_drop = list(exclude_features)
    for col in metadata_cols:
        if col in df.columns and col not in cols_to_drop:
            cols_to_drop.append(col)

    X = df.drop(columns=[c for c in cols_to_drop if c in df.columns])

    logger.info(f"Features: {X.shape[1]} columns, {X.shape[0]} samples")
    logger.info(f"Feature names: {list(X.columns[:5])}... (showing first 5)")

    # Scale if needed
    if scaler is not None:
        logger.info("Scaling features...")
        X_scaled = scaler.transform(X)
    else:
        X_scaled = X
        logger.info("No scaling applied")

    # Make predictions
    logger.info("Making predictions...")
    y_pred_log = model.predict(X_scaled)

    # Inverse transform (convert from log scale back to actual)
    logger.info("Converting predictions from log scale to actual values...")
    y_pred_actual = inverse_transform_predictions(y_pred_log)

    # Get target if available
    target = config['modeling']['target']
    if target in df.columns:
        y_test_log = df[target].values
        y_test_actual = inverse_transform_predictions(y_test_log)

        # Calculate metrics
        mae = np.mean(np.abs(y_test_actual - y_pred_actual))
        rmse = np.sqrt(np.mean((y_test_actual - y_pred_actual) ** 2))
        r2 = 1 - (np.sum((y_test_actual - y_pred_actual) ** 2) / np.sum((y_test_actual - np.mean(y_test_actual)) ** 2))
        mape = np.mean(np.abs((y_test_actual - y_pred_actual) / y_test_actual)) * 100

        logger.info("\n" + "=" * 70)
        logger.info("PREDICTION METRICS (Actual Scale)")
        logger.info("=" * 70)
        logger.info(f"MAE:  {mae:>12,.2f} visitors")
        logger.info(f"RMSE: {rmse:>12,.2f} visitors")
        logger.info(f"R²:   {r2:>12.4f}")
        logger.info(f"MAPE: {mape:>12.2f}%")

    # Save predictions
    output_csv = os.path.join(
        config['modeling']['results_dir'],
        'predictions',
        f'{model_name}_predictions.csv'
    )

    os.makedirs(os.path.dirname(output_csv), exist_ok=True)

    results_df = pd.DataFrame({
        'actual': y_test_actual if target in df.columns else None,
        'predicted': y_pred_actual,
        'error': y_test_actual - y_pred_actual if target in df.columns else None
    })

    results_df.to_csv(output_csv, index=False)
    logger.info(f"\nPredictions saved to: {output_csv}")

    logger.info("\n" + "=" * 70)
    logger.info("PREDICTION COMPLETED")
    logger.info("=" * 70)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Make predictions using trained models')
    parser.add_argument('--model', default='best_model', help='Model to use (default: best_model)')
    parser.add_argument('--input', help='Input CSV file (optional, uses test set if not provided)')

    args = parser.parse_args()

    predict(model_name=args.model, input_csv=args.input)
