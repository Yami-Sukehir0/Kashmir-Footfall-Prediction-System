#!/usr/bin/env python3

"""
Model Comparison Script
Compare performance of all trained models
"""

import sys
import os
import yaml
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


def compare_models():
    """Compare all trained models"""

    # Load config
    with open('config/config.yaml', 'r') as f:
        config = yaml.safe_load(f)

    # Load comparison results
    results_path = os.path.join(
        config['modeling']['results_dir'],
        'metrics',
        'model_comparison.csv'
    )

    if not os.path.exists(results_path):
        print(f"Error: Results file not found at {results_path}")
        print("Please run training first: python scripts/train_models.py")
        return

    results_df = pd.read_csv(results_path)

    print("=" * 70)
    print("MODEL COMPARISON RESULTS")
    print("=" * 70)
    print(results_df.to_string(index=False))

    # Detailed comparison
    print("\n" + "=" * 70)
    print("DETAILED METRICS")
    print("=" * 70)

    for _, row in results_df.iterrows():
        print(f"\n{row['model'].upper()}")
        print(f"  MAE:  {row['mae']:>12,.2f} visitors")
        print(f"  RMSE: {row['rmse']:>12,.2f} visitors")
        print(f"  R²:   {row['r2']:>12.4f}")
        print(f"  MAPE: {row['mape']:>12.2f}%")

    # Rankings
    print("\n" + "=" * 70)
    print("RANKINGS")
    print("=" * 70)

    print("\nBest MAE (Lower is better):")
    for idx, row in results_df.sort_values('mae').iterrows():
        print(f"  {idx + 1}. {row['model']:20s} - {row['mae']:>10,.2f}")

    print("\nBest R² (Higher is better):")
    for idx, row in results_df.sort_values('r2', ascending=False).iterrows():
        print(f"  {idx + 1}. {row['model']:20s} - {row['r2']:>10.4f}")

    # Recommendation
    best_model = results_df.loc[results_df['r2'].idxmax(), 'model']
    print("\n" + "=" * 70)
    print(f"RECOMMENDED MODEL: {best_model.upper()}")
    print("=" * 70)


if __name__ == "__main__":
    compare_models()
