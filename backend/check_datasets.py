import pandas as pd

# Load datasets
df1 = pd.read_csv('data/model_ready/kashmir_tourism_simple_label.csv')
df2 = pd.read_csv('data/kashmir_tourism_LOG_TRANSFORMED_option2.csv')

print("Simple label dataset:")
print("Columns:", list(df1.columns))
print("Shape:", df1.shape)
print("\nFirst few rows:")
print(df1.head(3))

print("\n" + "="*50)

print("Log transformed dataset:")
print("Columns:", list(df2.columns))
print("Shape:", df2.shape)
print("\nFirst few rows:")
print(df2.head(3))

print("\n" + "="*50)

# Check target column
print("Target column in simple label:", df1['Footfall'].describe())
print("Target column in log transformed:", df2['Footfall'].describe())