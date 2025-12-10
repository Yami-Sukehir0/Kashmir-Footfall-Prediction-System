#!/usr/bin/env python3

"""
Model Evaluator
Advanced evaluation and visualization for trained models
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import logging
from typing import Dict, Any, List
import joblib

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


class ModelEvaluator:
    """
    Evaluates and visualizes model performance
    """

    def __init__(self, config: Dict):
        """
        Initialize evaluator

        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.results_dir = config['modeling']['results_dir']
        self.plots_dir = os.path.join(self.results_dir, 'plots')
        self.predictions_dir = os.path.join(self.results_dir, 'predictions')

        # Create directories
        os.makedirs(self.plots_dir, exist_ok=True)
        os.makedirs(self.predictions_dir, exist_ok=True)

        self.logger = logging.getLogger(__name__)

        # Set style
        sns.set_style('whitegrid')
        plt.rcParams['figure.figsize'] = (12, 6)

    def plot_predictions_vs_actual(
            self,
            y_true: np.ndarray,
            y_pred: np.ndarray,
            model_name: str,
            save: bool = True
    ):
        """
        Create scatter plot of predictions vs actual values

        Args:
            y_true: True values
            y_pred: Predicted values
            model_name: Name of the model
            save: Whether to save the plot
        """
        fig, ax = plt.subplots(figsize=(10, 8))

        # Scatter plot
        ax.scatter(y_true, y_pred, alpha=0.6, s=50)

        # Perfect prediction line
        min_val = min(y_true.min(), y_pred.min())
        max_val = max(y_true.max(), y_pred.max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, label='Perfect Prediction')

        # Labels and title
        ax.set_xlabel('Actual Footfall', fontsize=12)
        ax.set_ylabel('Predicted Footfall', fontsize=12)
        ax.set_title(f'{model_name}: Predictions vs Actual', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)

        # Add metrics as text
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)

        textstr = f'MAE: {mae:,.0f}\nRMSE: {rmse:,.0f}\nR²: {r2:.4f}'
        props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)
        ax.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=11,
                verticalalignment='top', bbox=props)

        plt.tight_layout()

        if save:
            filepath = os.path.join(self.plots_dir, f'{model_name}_predictions_vs_actual.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            self.logger.info(f"Saved plot: {filepath}")

        plt.close()

    def plot_residuals(
            self,
            y_true: np.ndarray,
            y_pred: np.ndarray,
            model_name: str,
            save: bool = True
    ):
        """
        Create residual plot

        Args:
            y_true: True values
            y_pred: Predicted values
            model_name: Name of the model
            save: Whether to save the plot
        """
        residuals = y_true - y_pred

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

        # Residuals vs Predicted
        ax1.scatter(y_pred, residuals, alpha=0.6, s=50)
        ax1.axhline(y=0, color='r', linestyle='--', linewidth=2)
        ax1.set_xlabel('Predicted Footfall', fontsize=12)
        ax1.set_ylabel('Residuals', fontsize=12)
        ax1.set_title(f'{model_name}: Residual Plot', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)

        # Histogram of residuals
        ax2.hist(residuals, bins=30, edgecolor='black', alpha=0.7)
        ax2.axvline(x=0, color='r', linestyle='--', linewidth=2)
        ax2.set_xlabel('Residuals', fontsize=12)
        ax2.set_ylabel('Frequency', fontsize=12)
        ax2.set_title('Distribution of Residuals', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()

        if save:
            filepath = os.path.join(self.plots_dir, f'{model_name}_residuals.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            self.logger.info(f"Saved plot: {filepath}")

        plt.close()

    def plot_feature_importance(
            self,
            model: Any,
            feature_names: List[str],
            model_name: str,
            top_n: int = 15,
            save: bool = True
    ):
        """
        Plot feature importance for tree-based models

        Args:
            model: Trained model
            feature_names: List of feature names
            model_name: Name of the model
            top_n: Number of top features to show
            save: Whether to save the plot
        """
        # Check if model has feature importance
        if not hasattr(model, 'feature_importances_'):
            self.logger.warning(f"{model_name} does not have feature_importances_")
            return

        # Get feature importance
        importance = model.feature_importances_

        # Create DataFrame
        feature_importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)

        # Take top N
        feature_importance_df = feature_importance_df.head(top_n)

        # Plot
        fig, ax = plt.subplots(figsize=(10, 8))

        ax.barh(range(len(feature_importance_df)), feature_importance_df['importance'])
        ax.set_yticks(range(len(feature_importance_df)))
        ax.set_yticklabels(feature_importance_df['feature'])
        ax.set_xlabel('Importance', fontsize=12)
        ax.set_title(f'{model_name}: Top {top_n} Feature Importances', fontsize=14, fontweight='bold')
        ax.invert_yaxis()
        ax.grid(True, alpha=0.3, axis='x')

        plt.tight_layout()

        if save:
            filepath = os.path.join(self.plots_dir, f'{model_name}_feature_importance.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            self.logger.info(f"Saved plot: {filepath}")

            # Save CSV
            csv_path = os.path.join(self.results_dir, 'metrics', f'{model_name}_feature_importance.csv')
            feature_importance_df.to_csv(csv_path, index=False)

        plt.close()

    def plot_model_comparison(
            self,
            results_df: pd.DataFrame,
            save: bool = True
    ):
        """
        Create comparison plots for all models

        Args:
            results_df: DataFrame with model comparison results
            save: Whether to save the plot
        """
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))

        metrics = ['mae', 'rmse', 'r2', 'mape']
        titles = ['Mean Absolute Error', 'Root Mean Squared Error', 'R² Score', 'Mean Absolute % Error']

        for idx, (metric, title) in enumerate(zip(metrics, titles)):
            ax = axes[idx // 2, idx % 2]

            sorted_df = results_df.sort_values(metric, ascending=(metric != 'r2'))

            colors = ['green' if metric == 'r2' else 'red' if i == 0 else 'skyblue'
                      for i in range(len(sorted_df))]

            ax.barh(range(len(sorted_df)), sorted_df[metric], color=colors)
            ax.set_yticks(range(len(sorted_df)))
            ax.set_yticklabels(sorted_df['model'])
            ax.set_xlabel(title, fontsize=11)
            ax.set_title(title, fontsize=12, fontweight='bold')
            ax.invert_yaxis()
            ax.grid(True, alpha=0.3, axis='x')

            # Add values on bars
            for i, v in enumerate(sorted_df[metric]):
                if metric == 'r2':
                    ax.text(v, i, f' {v:.4f}', va='center', fontsize=9)
                elif metric == 'mape':
                    ax.text(v, i, f' {v:.2f}%', va='center', fontsize=9)
                else:
                    ax.text(v, i, f' {v:,.0f}', va='center', fontsize=9)

        plt.suptitle('Model Performance Comparison', fontsize=16, fontweight='bold', y=1.00)
        plt.tight_layout()

        if save:
            filepath = os.path.join(self.plots_dir, 'model_comparison.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            self.logger.info(f"Saved plot: {filepath}")

        plt.close()

    def plot_error_by_location(
            self,
            y_true: pd.Series,
            y_pred: np.ndarray,
            location_encoded: pd.Series,
            model_name: str,
            save: bool = True
    ):
        """
        Plot error distribution by location

        Args:
            y_true: True values with index
            y_pred: Predicted values
            location_encoded: Location encoding
            model_name: Name of the model
            save: Whether to save the plot
        """
        # Calculate errors
        errors = np.abs(y_true.values - y_pred)

        # Create DataFrame
        error_df = pd.DataFrame({
            'location': location_encoded.values,
            'error': errors,
            'actual': y_true.values,
            'predicted': y_pred
        })

        # Calculate metrics by location
        location_metrics = error_df.groupby('location').agg({
            'error': ['mean', 'median', 'std'],
            'actual': 'mean'
        }).reset_index()

        location_metrics.columns = ['location', 'mae', 'median_error', 'std_error', 'avg_footfall']

        # Plot
        fig, ax = plt.subplots(figsize=(12, 6))

        x = range(len(location_metrics))
        ax.bar(x, location_metrics['mae'], yerr=location_metrics['std_error'],
               capsize=5, alpha=0.7, color='coral')
        ax.set_xticks(x)
        ax.set_xticklabels([f'Loc {int(loc)}' for loc in location_metrics['location']])
        ax.set_xlabel('Location', fontsize=12)
        ax.set_ylabel('Mean Absolute Error', fontsize=12)
        ax.set_title(f'{model_name}: Error by Location', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3, axis='y')

        plt.tight_layout()

        if save:
            filepath = os.path.join(self.plots_dir, f'{model_name}_error_by_location.png')
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            self.logger.info(f"Saved plot: {filepath}")

            # Save CSV
            csv_path = os.path.join(self.results_dir, 'metrics', f'{model_name}_error_by_location.csv')
            location_metrics.to_csv(csv_path, index=False)

        plt.close()

    def save_predictions(
            self,
            y_true: pd.Series,
            y_pred: np.ndarray,
            model_name: str,
            X_test: pd.DataFrame = None
    ):
        """
        Save predictions to CSV

        Args:
            y_true: True values
            y_pred: Predicted values
            model_name: Name of the model
            X_test: Test features (optional)
        """
        predictions_df = pd.DataFrame({
            'actual': y_true.values,
            'predicted': y_pred,
            'error': y_true.values - y_pred,
            'abs_error': np.abs(y_true.values - y_pred),
            'percent_error': np.abs((y_true.values - y_pred) / y_true.values) * 100
        }, index=y_true.index)

        # Add features if provided
        if X_test is not None:
            predictions_df = pd.concat([X_test, predictions_df], axis=1)

        # Save
        filepath = os.path.join(self.predictions_dir, f'{model_name}_predictions.csv')
        predictions_df.to_csv(filepath, index=True)
        self.logger.info(f"Saved predictions: {filepath}")
