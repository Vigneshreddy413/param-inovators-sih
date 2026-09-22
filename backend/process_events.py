import pandas as pd
from datetime import datetime
import logging
import os

logger = logging.getLogger(__name__)

def run_process_events(input_file="../data/india_thermal_events.csv", output_file="../data/thermosentry_events.csv"):
    logger.info("Starting THERMOSENTRY EVENT PROCESSOR")
    
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False

    df = pd.read_csv(input_file)
    logger.info(f"Loaded {len(df)} raw FIRMS observations.")

    # Create unique event IDs
    df["event_id"] = [
        f"TH-{i:06d}" for i in range(1, len(df) + 1)
    ]

    # Convert acquisition time to HH:MM
    df["acq_time"] = df["acq_time"].astype(str).str.zfill(4)

    df["observation_time"] = pd.to_datetime(
        df["acq_date"].astype(str) + " " +
        df["acq_time"].str[:2] + ":" +
        df["acq_time"].str[2:4],
        errors="coerce"
    )

    # Create initial status
    df["status"] = "UNCLASSIFIED"

    # Select important THERMOSENTRY fields
    events = df[
        [
            "event_id",
            "latitude",
            "longitude",
            "observation_time",
            "satellite",
            "instrument",
            "bright_ti4",
            "bright_ti5",
            "frp",
            "confidence",
            "daynight",
            "status"
        ]
    ]

    # Save processed events
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    events.to_csv(output_file, index=False)
    
    logger.info(f"Processed {len(events)} THERMOSENTRY events.")
    logger.info(f"Saved to: {output_file}")
    
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    run_process_events()