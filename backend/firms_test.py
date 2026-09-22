import os
import requests
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

MAP_KEY = os.getenv("FIRMS_MAP_KEY")

if not MAP_KEY:
    raise ValueError("FIRMS_MAP_KEY not found in .env")

# India bounding box
# west, south, east, north
INDIA_BBOX = "68,6,97,36"

url = (
    f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
    f"{MAP_KEY}/VIIRS_SNPP_NRT/{INDIA_BBOX}/1"
)

print("Downloading FIRMS data for India...")

response = requests.get(url)

print("Status code:", response.status_code)

if response.status_code != 200:
    print("Error:", response.text)
    raise SystemExit()

# Convert CSV response into DataFrame
from io import StringIO

df = pd.read_csv(StringIO(response.text))

print(f"Total thermal events received: {len(df)}")

# Save the data
output_file = "../data/india_thermal_events.csv"
df.to_csv(output_file, index=False)

print(f"Saved successfully to: {output_file}")

# Show first 5 events
print("\nFirst 5 thermal events:")
print(df.head())