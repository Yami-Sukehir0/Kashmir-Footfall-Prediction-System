import pandas as pd
import numpy as np
import os

print("=" * 80)
print("FINDING THE LOG TRANSFORMATION SOURCE")
print("=" * 80)

# Check interim files
interim_files = [
    "data/interim/monthly_weather_data/monthly_weather_srinagar.csv",
    "data/interim/monthly_tourist_data_2020_2024.csv",
    "data/processed/merged_tourism_data.csv",
    "data/processed/kashmir_tourism_dataset_final.csv"
]

for file_path in interim_files:
    if os.path.exists(file_path):
        try:
            df = pd.read_csv(file_path)
            print(f"\n{file_path}")
            print(f"  Shape: {df.shape}")
            print(f"  Columns: {list(df.columns)[:15]}")

            # Check for Footfall or tourist columns
            footfall_cols = [col for col in df.columns if
                             'footfall' in col.lower() or 'tourist' in col.lower() or 'total' in col.lower()]

            if footfall_cols:
                for col in footfall_cols[:3]:  # Check first 3 relevant columns
                    values = df[col].dropna()
                    if len(values) > 0:
                        print(f"\n  {col}:")
                        print(f"    Min: {values.min():,.2f}")
                        print(f"    Max: {values.max():,.2f}")
                        print(f"    Sample: {values.head(5).tolist()}")

                        # Check if log-transformed
                        if values.max() < 20:
                            print(f"    ⚠️ Likely log-transformed!")
        except Exception as e:
            print(f"\n{file_path}")
            print(f"  Error: {e}")
    else:
        print(f"\n{file_path}")
        print(f"  File not found")

print("\n" + "=" * 80)
