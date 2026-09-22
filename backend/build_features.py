import pandas as pd
import requests
import math
import logging
import time
import os

logger = logging.getLogger(__name__)

def distance_km(lat1, lon1, lat2, lon2):
    R = 6371.0

    p1 = math.radians(lat1)
    p2 = math.radians(lat2)

    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)

    a = (
        math.sin(dp / 2) ** 2
        + math.cos(p1)
        * math.cos(p2)
        * math.sin(dl / 2) ** 2
    )

    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_nearest_industry(lat, lon, max_retries=3):
    query = f"""
    [out:json][timeout:20];

    (
      nwr["landuse"="industrial"](around:5000,{lat},{lon});
      nwr["industrial"](around:5000,{lat},{lon});
      nwr["man_made"="works"](around:5000,{lat},{lon});
    );

    out center tags;
    """

    for attempt in range(max_retries):
        try:
            response = requests.get(
                "https://overpass-api.de/api/interpreter",
                params={"data": query},
                headers={"User-Agent": "THERMOSENTRY-SIH2026/1.0"},
                timeout=30
            )

            if response.status_code == 429:
                logger.warning(f"Rate limited (429). Retrying {attempt + 1}/{max_retries}...")
                time.sleep(2 ** attempt)
                continue

            if response.status_code != 200:
                logger.error(f"Overpass API error: {response.status_code}")
                return None

            elements = response.json().get("elements", [])

            nearest = None

            for item in elements:
                if "lat" in item and "lon" in item:
                    f_lat = item["lat"]
                    f_lon = item["lon"]
                elif "center" in item:
                    f_lat = item["center"]["lat"]
                    f_lon = item["center"]["lon"]
                else:
                    continue

                d = distance_km(lat, lon, f_lat, f_lon)

                if nearest is None or d < nearest:
                    nearest = d

            return nearest

        except requests.exceptions.RequestException as e:
            logger.warning(f"Request failed: {e}. Retrying {attempt + 1}/{max_retries}...")
            time.sleep(2 ** attempt)
            
    logger.error("Max retries exceeded for Overpass API.")
    return None

def run_build_features(input_file="../data/thermosentry_events.csv", output_file="../data/thermosentry_features.csv"):
    logger.info("Starting THERMOSENTRY FEATURE BUILDER")
    
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False

    df = pd.read_csv(input_file)

    logger.info("Building THERMOSENTRY feature dataset...")

    # Basic thermal features
    df["frp"] = pd.to_numeric(df["frp"], errors="coerce")
    df["bright_ti4"] = pd.to_numeric(df["bright_ti4"], errors="coerce")
    df["bright_ti5"] = pd.to_numeric(df["bright_ti5"], errors="coerce")

    # Calculate industry distance
    distances = []
    total = len(df)

    for i, row in df.iterrows():
        if i % 10 == 0:
            logger.info(f"Processing event {i + 1}/{total}")

        distance = find_nearest_industry(
            row["latitude"],
            row["longitude"]
        )

        distances.append(distance)

    df["distance_to_industry_km"] = distances

    # Save
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)

    logger.info(f"Feature dataset created and saved to: {output_file}")
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    run_build_features()