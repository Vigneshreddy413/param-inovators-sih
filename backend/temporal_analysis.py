import pandas as pd
import logging
import os

logger = logging.getLogger(__name__)

def run_temporal_analysis(input_file="../data/thermosentry_anomalies.csv", output_file="../data/thermosentry_temporal.csv"):
    logger.info("Starting THERMOSENTRY TEMPORAL ENGINE")
    
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False

    df = pd.read_csv(input_file)

    df["observation_time"] = pd.to_datetime(
        df["observation_time"],
        errors="coerce"
    )

    df["frp"] = pd.to_numeric(
        df["frp"],
        errors="coerce"
    )

    # Create a coarse spatial group.
    # This lets us examine repeated activity
    # around approximately the same location.
    df["location_group"] = (
        df["latitude"].round(2).astype(str)
        + "_"
        + df["longitude"].round(2).astype(str)
    )

    # Sort chronologically
    df = df.sort_values("observation_time")

    # Count observations in each location
    df["location_observation_count"] = (
        df.groupby("location_group")["event_id"]
        .transform("count")
    )

    # Average FRP around the same location
    df["location_avg_frp"] = (
        df.groupby("location_group")["frp"]
        .transform("mean")
    )

    # Persistence indicator
    df["persistent_activity"] = (
        df["location_observation_count"] >= 3
    )

    # Compare each event's FRP with its local average
    df["frp_change_percent"] = (
        (df["frp"] - df["location_avg_frp"])
        / df["location_avg_frp"].replace(0, pd.NA)
    ) * 100

    # Initial escalation indicator
    df["escalation_flag"] = (
        (df["persistent_activity"])
        & (df["frp_change_percent"] > 50)
    )

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)

    logger.info(f"Total events: {len(df)}")
    logger.info(f"Persistent events: {df['persistent_activity'].sum()}")
    logger.info(f"Potential escalation events: {df['escalation_flag'].sum()}")
    logger.info(f"Saved: {output_file}")
    
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    run_temporal_analysis()