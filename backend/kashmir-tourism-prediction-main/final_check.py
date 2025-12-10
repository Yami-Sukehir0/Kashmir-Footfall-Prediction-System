import pandas as pd
import numpy as np

df = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')

print("="*70)
print("FINAL DATASET QUALITY CHECK")
print("="*70)

# Basic info
print(f"\n✓ Total Records: {len(df)}")
print(f"✓ Total Features: {len(df.columns)}")
print(f"✓ Missing Values: {df.isnull().sum().sum()}")

# Footfall statistics
print(f"\n{'='*70}")
print("FOOTFALL STATISTICS")
print(f"{'='*70}")
print(f"  Min:     {df['Footfall'].min():>10,} (should be ≥ 1,000)")
print(f"  Max:     {df['Footfall'].max():>10,}")
print(f"  Mean:    {df['Footfall'].mean():>10,.0f}")
print(f"  Median:  {df['Footfall'].median():>10,.0f}")
print(f"  Std Dev: {df['Footfall'].std():>10,.0f}")

# Distribution
print(f"\n{'='*70}")
print("FOOTFALL DISTRIBUTION")
print(f"{'='*70}")
ranges = {
    "1K-9.9K": ((df['Footfall'] >= 1000) & (df['Footfall'] < 10000)).sum(),
    "10K-49.9K": ((df['Footfall'] >= 10000) & (df['Footfall'] < 50000)).sum(),
    "50K-99.9K": ((df['Footfall'] >= 50000) & (df['Footfall'] < 100000)).sum(),
    "100K-199.9K": ((df['Footfall'] >= 100000) & (df['Footfall'] < 200000)).sum(),
    "≥200K": (df['Footfall'] >= 200000).sum()
}

for label, count in ranges.items():
    pct = count/len(df)*100
    print(f"  {label:15s}: {count:>4} records ({pct:>5.1f}%)")

# Check by year
print(f"\n{'='*70}")
print("FOOTFALL BY YEAR")
print(f"{'='*70}")
for year in sorted(df['year'].unique()):
    year_data = df[df['year'] == year]
    print(f"  {year}: Mean={year_data['Footfall'].mean():>9,.0f}, "
          f"Min={year_data['Footfall'].min():>7,}, "
          f"Max={year_data['Footfall'].max():>9,}")

# Feature list
print(f"\n{'='*70}")
print("FEATURE LIST ({} features)".format(len(df.columns)))
print(f"{'='*70}")
for i, col in enumerate(df.columns, 1):
    print(f"  {i:2d}. {col}")

# Final verdict
print(f"\n{'='*70}")
print("FINAL VERDICT")
print(f"{'='*70}")

issues = []
if df['Footfall'].min() < 1000:
    issues.append(f"❌ Minimum footfall is {df['Footfall'].min()}, should be ≥ 1,000")
if df.isnull().sum().sum() > 0:
    issues.append(f"❌ {df.isnull().sum().sum()} missing values found")
if len(df) != 840:
    issues.append(f"❌ Expected 840 records, got {len(df)}")
if len(df.columns) != 17:
    issues.append(f"❌ Expected 17 features, got {len(df.columns)}")

if not issues:
    print("\n✅ ✅ ✅ DATASET IS PRODUCTION-READY! ✅ ✅ ✅")
    print("\nAll checks passed:")
    print("  ✓ No missing values")
    print("  ✓ All footfall ≥ 1,000")
    print("  ✓ 840 records (7 years × 10 locations × 12 months)")
    print("  ✓ 17 features (ready for model training)")
    print("\nYou can now proceed to model training!")
else:
    print("\n⚠️  ISSUES FOUND:")
    for issue in issues:
        print(f"  {issue}")
