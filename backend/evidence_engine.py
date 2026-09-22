import pandas as pd
import logging
import os

logger = logging.getLogger(__name__)

# -----------------------------------------
# Generate evidence
# -----------------------------------------

def generate_evidence(row):

    evidence = []

    # Thermal intensity
    if row["frp"] >= 50:
        evidence.append("High thermal intensity")
    elif row["frp"] >= 20:
        evidence.append("Moderate thermal intensity")

    # Anomaly
    if row["is_anomalous"]:
        evidence.append("Unusual thermal behaviour")

    # Persistence
    if row["persistent_activity"]:
        evidence.append("Persistent thermal activity")

    # Escalation
    if row["escalation_flag"]:
        evidence.append("Thermal activity may be escalating")

    # Industrial proximity
    distance = row["distance_to_industry_km"]

    if pd.notna(distance):

        if distance <= 1:
            evidence.append(
                "Very close to mapped industrial activity"
            )

        elif distance <= 3:
            evidence.append(
                "Industrial activity detected nearby"
            )

    if not evidence:
        evidence.append("Limited supporting evidence")

    return evidence

# -----------------------------------------
# Observation reliability
# -----------------------------------------

def reliability(row):

    reliability_score = 0

    # FIRMS confidence
    confidence = str(row.get("confidence", "")).lower()

    if confidence in ["h", "high"]:
        reliability_score += 40

    elif confidence in ["n", "nominal"]:
        reliability_score += 30

    elif confidence in ["l", "low"]:
        reliability_score += 15

    # FIRMS thermal information
    if pd.notna(row["frp"]):
        reliability_score += 20

    if pd.notna(row["bright_ti4"]):
        reliability_score += 20

    # Context availability
    if pd.notna(row["distance_to_industry_km"]):
        reliability_score += 20

    return min(reliability_score, 100)

def reliability_label(score):
    if score >= 75:
        return "GOOD"
    elif score >= 50:
        return "PARTIAL"
    return "LIMITED"

def run_evidence_engine(input_file="../data/thermosentry_temporal.csv", output_file="../data/thermosentry_evidence.csv"):
    logger.info("Starting THERMOSENTRY EVIDENCE ENGINE")
    
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False

    df = pd.read_csv(input_file)

    # Make sure numeric fields are numeric
    df["frp"] = pd.to_numeric(df["frp"], errors="coerce")
    df["distance_to_industry_km"] = pd.to_numeric(
        df["distance_to_industry_km"],
        errors="coerce"
    )

    df["anomaly_score"] = pd.to_numeric(
        df["anomaly_score"],
        errors="coerce"
    )

    df["evidence"] = df.apply(generate_evidence, axis=1)

    # Convert list into readable text
    df["evidence"] = df["evidence"].apply(lambda x: " | ".join(x))

    df["observation_reliability"] = df.apply(reliability, axis=1)
    df["reliability_label"] = df["observation_reliability"].apply(reliability_label)

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    df.to_csv(output_file, index=False)

    logger.info(f"Total events processed for evidence: {len(df)}")
    logger.info(f"Saved: {output_file}")
    
    return True

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    run_evidence_engine()