import pandas as pd
import logging
import os

logger = logging.getLogger(__name__)

def risk_level(score):
    if score >= 75:
        return "CRITICAL"
    elif score >= 50:
        return "HIGH"
    elif score >= 25:
        return "MEDIUM"
    return "LOW"

def run_risk_engine(input_file="../data/thermosentry_anomalies.csv", output_file="../data/thermosentry_risk.csv"):
    logger.info("Starting THERMOSENTRY RISK ENGINE")
    
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False

    df = pd.read_csv(input_file)

    # Normalize anomaly score into a simple 0–100 indicator
    score = df["anomaly_score"]
    minimum = score.min()
    maximum = score.max()

    if maximum != minimum:
        df["anomaly_risk"] = ((maximum - score) / (maximum - minimum) * 100)
    else:
        df["anomaly_risk"] = 0

    # Industrial proximity indicator
    df["proximity_risk"] = 0
    df.loc[df["distance_to_industry_km"] <= 1, "proximity_risk"] = 100
    df.loc[(df["distance_to_industry_km"] > 1) & (df["distance_to_industry_km"] <= 3), "proximity_risk"] = 60
    df.loc[df["distance_to_industry_km"] > 3, "proximity_risk"] = 20

    # Initial prototype risk score
    df["risk_score"] = (df["anomaly_risk"] * 0.6 + df["proximity_risk"] * 0.4)
    df["risk_level"] = df["risk_score"].apply(risk_level)

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)

    logger.info(f"Total events processed for risk: {len(df)}")
    logger.info(f"Saved: {output_file}")
    
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    run_risk_engine()