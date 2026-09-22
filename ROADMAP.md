# THERMOSENTRY ROADMAP

## Phase 1: CURRENT MVP (SIH 2026 Demo)
* **Data Ingestion:** NASA FIRMS (VIIRS/MODIS) CSV integration.
* **Context:** OpenStreetMap Overpass spatial proximity.
* **AI Model:** Unsupervised Isolation Forest for anomaly detection.
* **Explainability:** Evidence Engine & Risk Engine (Heuristic).
* **Interface:** React/Leaflet Intelligence Dashboard with human-in-the-loop actions.

## Phase 2: NEXT VERSION (Post-Hackathon)
* **Storage:** Migration from CSV files to a PostGIS spatial database.
* **Automation:** Celery/Redis for automated scheduled pipeline runs.
* **Alerting:** Outbound webhooks (e.g., n8n, Slack, PagerDuty) triggered by CRITICAL events.
* **Weather Fusion:** Integration of live wind-vector and humidity data to assess immediate fire-spread risk.

## Phase 3: PRODUCTION VERSION
* **Supervised AI:** Transitioning from unsupervised anomaly detection to a supervised XGBoost classifier, trained on verified ground-truth dispatch logs acquired from local fire departments.
* **Multi-Sensor Fusion:** Integration of Geostationary satellite data (e.g., GOES) for higher temporal frequency (monitoring every 10 minutes instead of a few times a day).
* **Enterprise SSO:** Role-based access control for multiple response agencies.
* **Feedback Loop:** Implementing continuous model retraining based on Analyst "False Positive" / "Confirmed" UI decisions.
