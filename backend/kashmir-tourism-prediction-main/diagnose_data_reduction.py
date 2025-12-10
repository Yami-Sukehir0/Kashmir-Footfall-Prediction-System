import pandas as pd
import numpy as np

print("=" * 80)
print("DATA REDUCTION DIAGNOSTIC")
print("=" * 80)

# Check each stage of the pipeline
stages = {
    "1. Generated Footfall": "data/processed/generated_footfall_data.csv",
    "2. Final Dataset (Before Enhancement)": "data/processed/kashmir_tourism_dataset_final.csv",
    "3. Enhanced Dataset (After Enhancement)": "data/processed/enhanced_dataset.csv",
    "4. Model Ready (After Feature Eng)": "data/model_ready/kashmir_tourism_simple_label.csv"
}

for stage_name, file_path in stages.items():
    try:
        df = pd.read_csv(file_path)

        print(f"\n{stage_name}")
        print(f"  File: {file_path}")
        print(f"  Shape: {df.shape}")

        if 'Footfall' in df.columns:
            footfall = df['Footfall']

            # Check if log-transformed (values < 20 indicate log scale)
            if footfall.max() < 20:
                print(f"  ⚠️ Log-transformed data detected!")
                footfall = np.expm1(footfall)  # Convert back
                print(f"  Converting to original scale...")

            print(f"  Footfall Min: {footfall.min():,.0f}")
            print(f"  Footfall Max: {footfall.max():,.0f}")
            print(f"  Footfall Mean: {footfall.mean():,.0f}")
            print(f"  Footfall Median: {footfall.median():,.0f}")

            # Show sample
            print(f"  Sample values: {footfall.head(10).tolist()}")
        else:
            print(f"  ⚠️ No 'Footfall' column found")
            print(f"  Columns: {list(df.columns)[:10]}...")

    except FileNotFoundError:
        print(f"\n{stage_name}")
        print(f"  ❌ File not found: {file_path}")
    except Exception as e:
        print(f"\n{stage_name}")
        print(f"  ❌ Error: {e}")

print("\n" + "=" * 80)
