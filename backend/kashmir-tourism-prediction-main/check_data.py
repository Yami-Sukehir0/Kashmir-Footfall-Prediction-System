import pandas as pd
import os

print("=" * 70)
print("DATA QUALITY CHECK")
print("=" * 70)

# Check 1: Weather files
weather_dir = "data/interim/weather_data"
if os.path.exists(weather_dir):
    weather_files = [f for f in os.listdir(weather_dir) if f.endswith('.csv')]
    print(f"\n1. Weather Files: {len(weather_files)}/10")
    for f in sorted(weather_files):
        print(f"   - {f}")
else:
    print("\n1. Weather directory not found!")

# Check 2: Processed files
processed_files = {
    "Weather Combined": "data/processed/kashmir_weather_monthly_combined.csv",
    "Footfall Generated": "data/processed/kashmir_sites_monthly_footfall_2017_2024.csv",
    "Final Dataset": "data/processed/kashmir_tourism_dataset_final.csv"
}

print("\n2. Processed Files:")
for name, path in processed_files.items():
    if os.path.exists(path):
        df = pd.read_csv(path)
        print(f"   ✓ {name}: {len(df)} rows")
    else:
        print(f"   ✗ {name}: NOT FOUND")

# Check 3: Final ML-ready file
final_file = "data/model_ready/kashmir_tourism_simple_label.csv"
if os.path.exists(final_file):
    df = pd.read_csv(final_file)
    print(f"\n3. Final ML-Ready Dataset:")
    print(f"   - Rows: {len(df)}")
    print(f"   - Columns: {len(df.columns)}")
    print(f"   - Column names: {list(df.columns)}")

    # Check for missing values
    missing = df.isnull().sum().sum()
    print(f"   - Missing values: {missing}")

    # Check unique locations
    if 'location_encoded' in df.columns:
        unique_locs = df['location_encoded'].nunique()
        print(f"   - Unique locations: {unique_locs}/10")

    print(f"\n   First few rows:")
    print(df.head())

    # Expected vs actual
    expected_rows = 840  # 10 locations × 84 months
    completion = (len(df) / expected_rows) * 100
    print(f"\n   Data Completeness: {completion:.1f}% ({len(df)}/{expected_rows} rows)")

    if completion == 100:
        print("\n   ✓ PERFECT! All data collected successfully!")
    elif completion >= 70:
        print(f"\n   ⚠ PARTIAL DATA: {unique_locs}/10 locations")
        print("   Pipeline worked, but some API calls failed.")
    else:
        print(f"\n   ✗ INCOMPLETE: Only {completion:.1f}% of expected data")
else:
    print("\n3. Final file NOT FOUND!")

print("\n" + "=" * 70)
