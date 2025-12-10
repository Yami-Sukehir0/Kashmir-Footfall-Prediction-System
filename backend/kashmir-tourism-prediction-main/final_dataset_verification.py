# import pandas as pd
# import numpy as np
#
# df = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')
#
# print("=" * 70)
# print("FINAL DATASET VERIFICATION")
# print("=" * 70)
#
# print(f"\nTotal rows: {len(df)}")
# print(f"Total columns: {len(df.columns)}")
#
# print(f"\nFootfall statistics (LOG-TRANSFORMED):")
# print(df['Footfall'].describe())
#
# print(f"\nFootfall range:")
# print(f"  Min: {df['Footfall'].min():.4f}")
# print(f"  Max: {df['Footfall'].max():.4f}")
# print(f"  Mean: {df['Footfall'].mean():.4f}")
#
# # Convert back to see original scale
# print(f"\nFootfall in ORIGINAL scale (expm1):")
# original_scale = np.expm1(df['Footfall'])
# print(f"  Min: {original_scale.min():,.0f}")
# print(f"  Max: {original_scale.max():,.0f}")
# print(f"  Mean: {original_scale.mean():,.0f}")
#
# # Check if any values are still 1000 (the bug)
# if (df['Footfall'] == 1000).any():
#     print("\n⚠️ WARNING: Found Footfall values = 1000 (BUG STILL EXISTS!)")
#     print(f"  Count: {(df['Footfall'] == 1000).sum()}")
# else:
#     print("\n✓ SUCCESS: No Footfall values stuck at 1000!")
#
# # Check distribution
# print(f"\nUnique Footfall values (first 20):")
# print(sorted(df['Footfall'].unique())[:20])
#
# print("\n" + "=" * 70)

import pandas as pd
import numpy as np

df = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')
original = np.expm1(df['Footfall'])
print(f"Max: {original.max():,.0f}")  # Should be ~1,500,000 now!
