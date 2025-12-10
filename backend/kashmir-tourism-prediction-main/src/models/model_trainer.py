#!/usr/bin/env python3
"""
Model Trainer - COMPLETE FEATURE SET VERSION
Trains models using ALL engineered features for location-specific, temporal predictions
"""

import pandas as pd
import numpy as np
import os
import logging
import joblib
from datetime import datetime
from typing import Dict, Tuple, List, Any
from sklearn.model_selection import train_test_split, GridSearchCV, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error


class ModelTrainer:
    """
    Trains and evaluates multiple regression models for tourism prediction
    Uses COMPLETE feature set including location, time, weather, and holidays
    """

    def __init__(self, config: Dict):
        """
        Initialize the model trainer

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.modeling_config = config['modeling']

        # Paths
        self.data_path = os.path.join(
            config['paths']['model_ready'],
            'kashmir_tourism_simple_label.csv'
        )
        self.model_dir = config['paths']['models']

        # Setup logging
        self.logger = logging.getLogger(__name__)

        # Model storage
        self.models = {}
        self.results = {}
        self.feature_names = None
        self.scaler = None

    def load_data(self) -> pd.DataFrame:
        """
        Load and validate the engineered dataset

        Returns:
            DataFrame with all features and target
        """
        self.logger.info(f"Loading data from: {self.data_path}")

        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Data file not found: {self.data_path}")

        df = pd.read_csv(self.data_path)
        self.logger.info(f"Loaded {len(df)} rows and {len(df.columns)} columns")
        self.logger.info(f"Columns: {df.columns.tolist()}")

        # Check for required columns
        required_cols = ['Footfall', 'location_encoded', 'year', 'month']
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        # Check for NaN values
        if df.isnull().any().any():
            self.logger.warning(f"Found {df.isnull().sum().sum()} NaN values")
            self.logger.warning("Filling NaN with forward fill then backward fill")
            df = df.fillna(method='ffill').fillna(method='bfill')

        self.logger.info(f"Data shape: {df.shape}")
        self.logger.info(f"Footfall range: {df['Footfall'].min():.2f} to {df['Footfall'].max():.2f}")

        return df

    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare features and target

        Args:
            df: Input DataFrame

        Returns:
            Tuple of (features DataFrame, target Series)
        """
        self.logger.info("Preparing features and target...")

        # Target
        y = df['Footfall'].copy()

        # Features: ALL columns except Footfall
        feature_cols = [col for col in df.columns if col != 'Footfall']
        X = df[feature_cols].copy()

        # Store feature names for later use
        self.feature_names = X.columns.tolist()

        self.logger.info(f"Target shape: {y.shape}")
        self.logger.info(f"Features shape: {X.shape}")
        self.logger.info(f"Feature names ({len(self.feature_names)}): {self.feature_names}")

        return X, y

    def split_data(self, X: pd.DataFrame, y: pd.Series,
                   test_size: float = 0.2,
                   val_size: float = 0.1) -> Tuple:
        """
        Split data into train, validation, and test sets
        Uses temporal split to avoid leakage

        Args:
            X: Features
            y: Target
            test_size: Proportion for test set
            val_size: Proportion for validation set

        Returns:
            Tuple of (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        self.logger.info("Splitting data (temporal split)...")

        # Sort by year and month to ensure temporal ordering
        if 'year' in X.columns and 'month' in X.columns:
            sort_idx = X.sort_values(['year', 'month']).index
            X = X.loc[sort_idx]
            y = y.loc[sort_idx]
            self.logger.info("Data sorted by year and month for temporal split")

        # Calculate split indices
        n = len(X)
        test_idx = int(n * (1 - test_size))
        val_idx = int(test_idx * (1 - val_size))

        # Split
        X_train = X.iloc[:val_idx]
        y_train = y.iloc[:val_idx]

        X_val = X.iloc[val_idx:test_idx]
        y_val = y.iloc[val_idx:test_idx]

        X_test = X.iloc[test_idx:]
        y_test = y.iloc[test_idx:]

        self.logger.info(f"Train set: {len(X_train)} samples")
        self.logger.info(f"Validation set: {len(X_val)} samples")
        self.logger.info(f"Test set: {len(X_test)} samples")

        return X_train, X_val, X_test, y_train, y_val, y_test

    def scale_features(self, X_train, X_val, X_test):
        """
        Scale features using StandardScaler

        Args:
            X_train: Training features
            X_val: Validation features
            X_test: Test features

        Returns:
            Tuple of scaled features
        """
        self.logger.info("Scaling features...")

        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        X_test_scaled = self.scaler.transform(X_test)

        self.logger.info("Feature scaling complete")

        return X_train_scaled, X_val_scaled, X_test_scaled

    def train_models(self, X_train, y_train, X_val, y_val):
        """
        Train multiple regression models

        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features
            y_val: Validation target
        """
        self.logger.info("=" * 70)
        self.logger.info("TRAINING MODELS")
        self.logger.info("=" * 70)

        # Model configurations
        models_config = {
            'Ridge': Ridge(alpha=10.0, random_state=42),
            'Lasso': Lasso(alpha=0.1, random_state=42),
            'RandomForest': RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=10,
                min_samples_leaf=4,
                random_state=42,
                n_jobs=-1
            ),
            'GradientBoosting': GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            ),
            'XGBoost': XGBRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42,
                n_jobs=-1
            )
        }

        # Train each model
        for name, model in models_config.items():
            self.logger.info(f"\nTraining {name}...")

            try:
                # Train
                model.fit(X_train, y_train)

                # Predict
                train_pred = model.predict(X_train)
                val_pred = model.predict(X_val)

                # Evaluate
                train_metrics = self._calculate_metrics(y_train, train_pred, "Train")
                val_metrics = self._calculate_metrics(y_val, val_pred, "Validation")

                # Store
                self.models[name] = model
                self.results[name] = {
                    'train_metrics': train_metrics,
                    'val_metrics': val_metrics,
                    'model': model
                }

                self.logger.info(f"✓ {name} training complete")

            except Exception as e:
                self.logger.error(f"✗ {name} training failed: {str(e)}")

    def _calculate_metrics(self, y_true, y_pred, dataset_name: str) -> Dict:
        """Calculate regression metrics"""
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true, y_pred)

        # MAPE (handle division by zero)
        mape = np.mean(np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), 1e-10))) * 100

        metrics = {
            'MAE': mae,
            'MSE': mse,
            'RMSE': rmse,
            'R2': r2,
            'MAPE': mape
        }

        self.logger.info(f"{dataset_name} - MAE: {mae:.4f}, RMSE: {rmse:.4f}, R2: {r2:.4f}, MAPE: {mape:.2f}%")

        return metrics

    def select_best_model(self) -> Tuple[str, Any]:
        """
        Select best model based on validation R2 score

        Returns:
            Tuple of (model_name, model)
        """
        self.logger.info("\n" + "=" * 70)
        self.logger.info("MODEL SELECTION")
        self.logger.info("=" * 70)

        best_name = None
        best_r2 = -float('inf')

        for name, result in self.results.items():
            val_r2 = result['val_metrics']['R2']
            self.logger.info(f"{name}: Validation R2 = {val_r2:.4f}")

            if val_r2 > best_r2:
                best_r2 = val_r2
                best_name = name

        self.logger.info(f"\n✓ Best model: {best_name} (R2 = {best_r2:.4f})")

        return best_name, self.models[best_name]

    def save_model(self, model_name: str, model: Any, test_metrics: Dict):
        """
        Save model, scaler, and metadata

        Args:
            model_name: Name of the model
            model: Trained model
            test_metrics: Test set metrics
        """
        self.logger.info("\n" + "=" * 70)
        self.logger.info("SAVING MODEL")
        self.logger.info("=" * 70)

        # Create directories
        os.makedirs(self.model_dir, exist_ok=True)
        best_model_dir = os.path.join(self.model_dir, 'best_model')
        os.makedirs(best_model_dir, exist_ok=True)

        # Save model
        model_path = os.path.join(best_model_dir, 'model.pkl')
        joblib.dump(model, model_path)
        self.logger.info(f"✓ Model saved: {model_path}")

        # Save scaler
        scaler_path = os.path.join(self.model_dir, 'scaler.pkl')
        joblib.dump(self.scaler, scaler_path)
        self.logger.info(f"✓ Scaler saved: {scaler_path}")

        # Save metadata
        metadata = {
            'feature_names': self.feature_names,
            'model_type': model_name.lower(),
            'num_features': len(self.feature_names),
            'trained_at': datetime.now().isoformat(),
            'test_metrics': test_metrics
        }

        metadata_path = os.path.join(self.model_dir, 'best_model_metadata.pkl')
        joblib.dump(metadata, metadata_path)
        self.logger.info(f"✓ Metadata saved: {metadata_path}")

        # Log feature names for reference
        self.logger.info(f"\nFeature names ({len(self.feature_names)}):")
        for i, name in enumerate(self.feature_names, 1):
            self.logger.info(f"  {i:2d}. {name}")

        self.logger.info("\n" + "=" * 70)
        self.logger.info("MODEL TRAINING COMPLETE!")
        self.logger.info("=" * 70)

    def train_and_save(self):
        """Complete training pipeline"""
        try:
            # Load data
            df = self.load_data()

            # Prepare features
            X, y = self.prepare_features(df)

            # Split data
            X_train, X_val, X_test, y_train, y_val, y_test = self.split_data(X, y)

            # Scale features
            X_train_scaled, X_val_scaled, X_test_scaled = self.scale_features(
                X_train, X_val, X_test
            )

            # Train models
            self.train_models(X_train_scaled, y_train, X_val_scaled, y_val)

            # Select best model
            best_name, best_model = self.select_best_model()

            # Test best model
            test_pred = best_model.predict(X_test_scaled)
            test_metrics = self._calculate_metrics(y_test, test_pred, "Test")

            # Save
            self.save_model(best_name, best_model, test_metrics)

            return best_name, test_metrics

        except Exception as e:
            self.logger.error(f"Training pipeline failed: {str(e)}")
            raise
