import pandas as pd

# Load FIRMS dataset
file_path = "../data/india_thermal_events.csv"

df = pd.read_csv(file_path)

print("\n========== THERMOSENTRY DATASET ==========")

print("\nTotal thermal events:", len(df))

print("\nColumns:")
for column in df.columns:
    print("-", column)

print("\nFirst 5 events:")
print(df.head())

print("\nDataset information:")
print(df.info())

print("\nBasic statistics:")
print(df.describe())