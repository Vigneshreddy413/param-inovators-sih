import pandas as pd
import requests

# Load THERMOSENTRY events
events_file = "../data/thermosentry_events.csv"
df = pd.read_csv(events_file)

# Take ONE thermal event
event = df.iloc[0]

lat = event["latitude"]
lon = event["longitude"]
event_id = event["event_id"]

print("\n===================================")
print("   THERMOSENTRY OSM CONTEXT TEST")
print("===================================")

print(f"\nEvent ID : {event_id}")
print(f"Latitude : {lat}")
print(f"Longitude: {lon}")

# Search OpenStreetMap within 5 km
overpass_query = f"""
[out:json][timeout:30];

(
  nwr["landuse"="industrial"](around:5000,{lat},{lon});
  nwr["industrial"](around:5000,{lat},{lon});
  nwr["man_made"="works"](around:5000,{lat},{lon});
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
    params={"data": overpass_query},
    headers=headers,
    timeout=60
)

print("OSM status code:", response.status_code)

if response.status_code != 200:
    print("\nOSM request failed.")
    print(response.text[:500])
    raise SystemExit()

data = response.json()

elements = data.get("elements", [])

print(f"\nNearby industrial features found: {len(elements)}")

if not elements:
    print("\nNo industrial features found within 5 km.")
else:
    print("\nNearby industrial features:")

    for item in elements[:10]:

        tags = item.get("tags", {})

        name = tags.get("name", "Unnamed")
        industrial_type = tags.get("industrial", "Not specified")
        landuse = tags.get("landuse", "Not specified")

        print("-----------------------------------")
        print("Name      :", name)
        print("Industrial:", industrial_type)
        print("Land use  :", landuse)
        print("OSM ID    :", item["id"])