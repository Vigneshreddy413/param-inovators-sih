import pandas as pd

INPUT = "../data/thermosentry_features.csv"
OUTPUT = "../data/thermal_fingerprint.csv"

df = pd.read_csv(INPUT)

print("Building thermal fingerprint...")

# Use nearest industrial distance to associate events
industrial_events = df[
    df["distance_to_industry_km"].notna()
].copy()

if industrial_events.empty:
    print("No industrial-context events available.")
    raise SystemExit()

# Group nearby observations by rounded location
industrial_events["location_group"] = (
    industrial_events["latitude"].round(2).astype(str)
    + "_"
    + industrial_events["longitude"].round(2).astype(str)
)

fingerprint = (
    industrial_events
    .groupby("location_group")
    .agg(
        normal_event_count=("event_id", "count"),
        normal_avg_frp=("frp", "mean"),
        normal_max_frp=("frp", "max"),
        normal_avg_brightness=("bright_ti4", "mean"),
        avg_distance_to_industry=("distance_to_industry_km", "mean")
    )
    .reset_index()
)

fingerprint.to_csv(OUTPUT, index=False)

print("\nThermal fingerprints created.")
print(fingerprint.head())

print("\nSaved:", OUTPUT)