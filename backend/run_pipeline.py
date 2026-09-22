import logging
import os
import sys

from process_events import run_process_events
from build_features import run_build_features
from anomaly_detection import run_anomaly_detection
from temporal_analysis import run_temporal_analysis
from evidence_engine import run_evidence_engine
from risk_engine import run_risk_engine

# Configure main logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("THERMOSENTRY_PIPELINE")

def main():
    logger.info("Starting THERMOSENTRY Data Pipeline...")
    
    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(base_dir, "data")
    
    raw_firms = os.path.join(data_dir, "india_thermal_events.csv")
    events = os.path.join(data_dir, "thermosentry_events.csv")
    features = os.path.join(data_dir, "thermosentry_features.csv")
    anomalies = os.path.join(data_dir, "thermosentry_anomalies.csv")
    temporal = os.path.join(data_dir, "thermosentry_temporal.csv")
    evidence = os.path.join(data_dir, "thermosentry_evidence.csv")
    risk = os.path.join(data_dir, "thermosentry_risk.csv")

    # Step 1: Process Events
    logger.info("--- STEP 1: EVENT PROCESSING ---")
    if not run_process_events(raw_firms, events):
        logger.error("Pipeline failed at Step 1.")
        sys.exit(1)

    # Step 2: Build Features (OSM API)
    logger.info("--- STEP 2: BUILD FEATURES ---")
    if not run_build_features(events, features):
        logger.error("Pipeline failed at Step 2.")
        sys.exit(1)

    # Step 3: Anomaly Detection
    logger.info("--- STEP 3: ANOMALY DETECTION ---")
    if not run_anomaly_detection(features, anomalies):
        logger.error("Pipeline failed at Step 3.")
        sys.exit(1)

    # Step 4: Temporal Analysis
    logger.info("--- STEP 4: TEMPORAL ANALYSIS ---")
    if not run_temporal_analysis(anomalies, temporal):
        logger.error("Pipeline failed at Step 4.")
        sys.exit(1)

    # Step 5: Evidence Engine
    logger.info("--- STEP 5: EVIDENCE ENGINE ---")
    if not run_evidence_engine(temporal, evidence):
        logger.error("Pipeline failed at Step 5.")
        sys.exit(1)

    # Step 6: Risk Engine
    logger.info("--- STEP 6: RISK ENGINE ---")
    if not run_risk_engine(anomalies, risk):
        logger.error("Pipeline failed at Step 6.")
        sys.exit(1)

    logger.info("=========================================")
    logger.info("THERMOSENTRY PIPELINE COMPLETED SUCCESSFULLY")
    logger.info("=========================================")

if __name__ == "__main__":
    main()
