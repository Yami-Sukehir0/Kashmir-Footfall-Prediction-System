import pandas as pd
import numpy as np

print("=" * 80)
print("OUTLIER CAPPING VERIFICATION")
print("=" * 80)

# Load final dataset
df = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')

print(f"\nTotal rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")

# Convert log-transformed footfall back to original scale
original_footfall = np.expm1(df['Footfall'])

print(f"\nFootfall statistics (ORIGINAL SCALE after transformations):")
print(f"  Min: {original_footfall.min():,.0f}")
print(f"  Max: {original_footfall.max():,.0f}")  # Should be capped!
print(f"  Mean: {original_footfall.mean():,.0f}")
print(f"  Median: {original_footfall.median():,.0f}")
print(f"  Std: {original_footfall.std():,.0f}")

# Check percentiles
print(f"\nPercentiles:")
for p in [50, 75, 90, 95, 99, 99.5, 100]:
    val = original_footfall.quantile(p/100)
    print(f"  {p:5.1f}th: {val:>12,.0f}")

# Check if capping worked
max_val = original_footfall.max()
p99_val = original_footfall.quantile(0.99)

print(f"\nCapping verification:")
print(f"  99th percentile: {p99_val:,.0f}")
print(f"  Maximum value:   {max_val:,.0f}")

if abs(max_val - p99_val) < 100:  # Within 100 visitors (accounting for rounding)
    print(f"  ✓ SUCCESS: Max value equals 99th percentile (capping worked!)")
else:
    print(f"  ⚠️ WARNING: Max value differs from 99th percentile by {abs(max_val - p99_val):,.0f}")

print("\n" + "=" * 80)
