import pandas as pd
import requests

# Load THERMOSENTRY events
df = pd.read_csv("../data/thermosentry_events.csv")

# Test one event
event = df.iloc[0]

event_id = event["event_id"]
lat = event["latitude"]
lon = event["longitude"]

print("\n===================================")
print(" THERMOSENTRY LAND-USE ENGINE")
print("===================================")

print(f"\nEvent ID : {event_id}")
print(f"Latitude : {lat}")
print(f"Longitude: {lon}")

# Search OSM around the thermal event
query = f"""
[out:json][timeout:30];

(
  nwr["landuse"](around:3000,{lat},{lon});
  nwr["natural"](around:3000,{lat},{lon});
);

out center tags;
"""

url = "https://overpass-api.de/api/interpreter"

headers = {
    "User-Agent": "THERMOSENTRY-SIH2026/1.0"
}

print("\nSearching OpenStreetMap for land-use context...")

response = requests.get(
    url,
    params={"data": query},
    headers=headers,
    timeout=60
)

print("OSM status code:", response.status_code)

if response.status_code != 200:
    print("OSM request failed.")
    raise SystemExit()

data = response.json()
elements = data.get("elements", [])

print(f"\nLand-use features found: {len(elements)}")

# Collect land-use categories
categories = set()

for item in elements:

    tags = item.get("tags", {})

    landuse = tags.get("landuse")
    natural = tags.get("natural")

    if landuse:
        categories.add(f"landuse={landuse}")

    if natural:
        categories.add(f"natural={natural}")

if categories:

    print("\nDetected surrounding context:")

    for category in sorted(categories):
        print("-", category)

else:

    print("\nNo mapped land-use context found.")