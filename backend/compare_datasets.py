import pandas as pd
import numpy as np

# Load datasets with full paths
df1 = pd.read_csv(r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\data\model_ready\kashmir_tourism_simple_label.csv')
df2 = pd.read_csv(r'C:\Users\HP\OneDrive\Desktop\kashmir-tourism-fullstack\backend\data\kashmir_tourism_LOG_TRANSFORMED_option2.csv')

print("=== Simple Label Dataset ===")
print("Columns:", list(df1.columns))
print("Shape:", df1.shape)
print("\nFirst 3 rows:")
print(df1.head(3))
print("\nTarget column statistics:")
print(df1['Footfall'].describe())

print("\n" + "="*60)

print("=== Log Transformed Dataset ===")
print("Columns:", list(df2.columns))
print("Shape:", df2.shape)
print("\nFirst 3 rows:")
print(df2.head(3))
print("\nTarget column statistics:")
print(df2['Footfall'].describe())

print("\n" + "="*60)

# Compare feature columns (excluding target)
feature_cols1 = [col for col in df1.columns if col != 'Footfall']
feature_cols2 = [col for col in df2.columns if col != 'Footfall']

print("Feature columns in simple label dataset:")
print(feature_cols1)
print("\nFeature columns in log transformed dataset:")
print(feature_cols2)

# Check if they have the same features
if set(feature_cols1) == set(feature_cols2):
    print("\n✅ Both datasets have the same feature columns")
else:
    print("\n❌ Datasets have different feature columns")
    print("In simple label but not in log transformed:", set(feature_cols1) - set(feature_cols2))
    print("In log transformed but not in simple label:", set(feature_cols2) - set(feature_cols1))