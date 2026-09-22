import pandas as pd
import requests
import math

# Load THERMOSENTRY events
df = pd.read_csv("../data/thermosentry_events.csv")

# Use the first event for testing
event = df.iloc[0]

event_id = event["event_id"]
event_lat = event["latitude"]
event_lon = event["longitude"]

print("\n===================================")
print(" THERMOSENTRY DISTANCE ENGINE")
print("===================================")

print(f"\nEvent ID : {event_id}")
print(f"Latitude : {event_lat}")
print(f"Longitude: {event_lon}")


# -------------------------------------------------
# Calculate distance between two coordinates
# -------------------------------------------------

def calculate_distance(lat1, lon1, lat2, lon2):

    earth_radius = 6371.0

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return earth_radius * c


# -------------------------------------------------
# Search OSM for industrial areas
# -------------------------------------------------

query = f"""
[out:json][timeout:30];

(
  nwr["landuse"="industrial"](around:5000,{event_lat},{event_lon});
  nwr["industrial"](around:5000,{event_lat},{event_lon});
  nwr["man_made"="works"](around:5000,{event_lat},{event_lon});
);

out center tags;
"""

url = "https://overpass-api.de/api/interpreter"

headers = {
    "User-Agent": "THERMOSENTRY-SIH2026/1.0"
}

print("\nSearching OpenStreetMap...")

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

print(f"Industrial features found: {len(elements)}")


# -------------------------------------------------
# Calculate nearest industrial feature
# -------------------------------------------------

nearest_distance = None
nearest_name = None

for item in elements:

    tags = item.get("tags", {})

    name = tags.get("name", "Unnamed industrial feature")

    # OSM objects can store coordinates differently
    if "lat" in item and "lon" in item:
        feature_lat = item["lat"]
        feature_lon = item["lon"]

    elif "center" in item:
        feature_lat = item["center"]["lat"]
        feature_lon = item["center"]["lon"]

    else:
        continue

    distance = calculate_distance(
        event_lat,
        event_lon,
        feature_lat,
        feature_lon
    )

    if nearest_distance is None or distance < nearest_distance:
        nearest_distance = distance
        nearest_name = name


# -------------------------------------------------
# Final result
# -------------------------------------------------

print("\n===================================")
print(" THERMOSENTRY RESULT")
print("===================================")

if nearest_distance is not None:

    print(f"\nNearest industrial feature:")
    print(f"Name     : {nearest_name}")
    print(f"Distance : {nearest_distance:.2f} km")

    if nearest_distance <= 1:
        print("\nIndustrial proximity: VERY HIGH")

    elif nearest_distance <= 3:
        print("\nIndustrial proximity: HIGH")

    else:
        print("\nIndustrial proximity: MODERATE")

else:

    print("\nNo usable industrial feature found.")