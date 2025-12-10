#!/usr/bin/env python3

"""
Verify Footfall Normalization
Compares footfall statistics before and after normalization
"""

import pandas as pd
import numpy as np


def analyze_footfall(filepath):
    """Analyze footfall statistics per year"""
    df = pd.read_csv(filepath)
    df['Year'] = df['Time'].str[:4].astype(int)

    print(f"\n{'=' * 70}")
    print("FOOTFALL ANALYSIS")
    print(f"{'=' * 70}")

    for year in sorted(df['Year'].unique()):
        year_data = df[df['Year'] == year]

        total = year_data['Footfall'].sum()
        mean = year_data['Footfall'].mean()
        std = year_data['Footfall'].std()
        median = year_data['Footfall'].median()

        print(f"\n{year}:")
        print(f"  Total:   {total:>15,.0f} visitors")
        print(f"  Mean:    {mean:>15,.0f} per month")
        print(f"  Median:  {median:>15,.0f}")
        print(f"  Std Dev: {std:>15,.0f}")
        print(f"  CV:      {(std / mean) * 100:>15.1f}% (coefficient of variation)")

    # Overall statistics
    print(f"\n{'=' * 70}")
    print("OVERALL STATISTICS")
    print(f"{'=' * 70}")

    baseline_years = [2021, 2022, 2023, 2024]
    anomalous_years = [2017, 2018, 2020]

    baseline_data = df[df['Year'].isin(baseline_years)]
    anomalous_data = df[df['Year'].isin(anomalous_years)]

    baseline_mean = baseline_data['Footfall'].mean()
    baseline_std = baseline_data['Footfall'].std()

    anomalous_mean = anomalous_data['Footfall'].mean()
    anomalous_std = anomalous_data['Footfall'].std()

    print(f"\nBaseline Years (2021-2024):")
    print(f"  Mean: {baseline_mean:,.0f}")
    print(f"  Std:  {baseline_std:,.0f}")

    print(f"\nAnomalous Years (2017-2018, 2020):")
    print(f"  Mean: {anomalous_mean:,.0f}")
    print(f"  Std:  {anomalous_std:,.0f}")

    print(f"\nMean Ratio: {anomalous_mean / baseline_mean:.2f} (should be close to 1.0)")
    print(f"Std Ratio:  {anomalous_std / baseline_std:.2f} (should be close to 1.0)")

    # Check homoskedasticity
    ratio = anomalous_mean / baseline_mean
    if 0.8 <= ratio <= 1.2:
        print(f"\n✓ GOOD: Means are similar (ratio: {ratio:.2f})")
    else:
        print(f"\n⚠ WARNING: Means differ significantly (ratio: {ratio:.2f})")


if __name__ == "__main__":
    filepath = "data/processed/kashmir_sites_monthly_footfall_2017_2024.csv"
    analyze_footfall(filepath)
