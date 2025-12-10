import pandas as pd

# Check the final ML-ready dataset
df = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')

print(f"Total columns: {len(df.columns)}")
print(f"\nColumn names:")
for i, col in enumerate(df.columns, 1):
    print(f"{i:2d}. {col}")

# Should show 23 columns including all these:
expected_cols = [
    'Footfall', 'location_encoded', 'year', 'month', 'season',
    'footfall_rolling_avg', 'temperature_2m_mean', 'temperature_2m_max',
    'temperature_2m_min', 'precipitation_sum', 'snowfall_sum',
    'precipitation_hours', 'windgusts_10m_max', 'relative_humidity_2m_mean',
    'sunshine_duration', 'temp_sunshine_interaction', 'temperature_range',
    'precipitation_temperature', 'holiday_count', 'long_weekend_count',
    'national_holiday_count', 'festival_holiday_count', 'days_to_next_holiday'
]

missing = set(expected_cols) - set(df.columns)
if missing:
    print(f"\n⚠️ Missing columns: {missing}")
else:
    print("\n✅ All expected columns present!")

import pandas as pd
df = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')

print("New days_to_next_holiday distribution:")
print(df['days_to_next_holiday'].value_counts().sort_index())

print("\nStatistics:")
print(df['days_to_next_holiday'].describe())

# Should now see values like: 3, 5, 7, 15, 30, 45, 60, 75, 90
# Much more realistic!
