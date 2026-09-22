import pandas as pd
from sklearn.ensemble import IsolationForest
import logging
import os

logger = logging.getLogger(__name__)

def run_anomaly_detection(input_file="../data/thermosentry_features.csv", output_file="../data/thermosentry_anomalies.csv"):
    logger.info("Starting THERMOSENTRY ANOMALY ENGINE")
    
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False

    df = pd.read_csv(input_file)

    features = [
        "frp",
        "bright_ti4",
        "bright_ti5",
        "distance_to_industry_km"
    ]

    data = df[features].copy()
    data = data.fillna(data.median())

    model = IsolationForest(
        n_estimators=200,
        contamination="auto",
        random_state=42
    )

    df["anomaly_prediction"] = model.fit_predict(data)
    df["anomaly_score"] = model.decision_function(data)
    df["is_anomalous"] = (df["anomaly_prediction"] == -1)

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)

    logger.info(f"Total events: {len(df)}")
    logger.info(f"Anomalous events: {df['is_anomalous'].sum()}")
    logger.info(f"Saved: {output_file}")
    
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    run_anomaly_detection()