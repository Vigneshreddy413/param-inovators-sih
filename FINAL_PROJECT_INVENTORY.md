# FINAL PROJECT INVENTORY

## DATA
* `data/training_data.csv` - IMPLEMENTED (Raw NASA FIRMS ingest)
* `data/thermosentry_risk.csv` - IMPLEMENTED (Final Enriched Data)

## PIPELINE (BACKEND)
* `backend/process_events.py` - IMPLEMENTED (NASA Data Sanitization)
* `backend/build_features.py` - IMPLEMENTED (OSM Context Geospatial Pipeline)

## ML (BACKEND)
* `backend/anomaly_detection.py` - IMPLEMENTED (Scikit-Learn Isolation Forest)
* `backend/temporal_analysis.py` - IMPLEMENTED (Historical FRP Escalation)
* `backend/evidence_engine.py` - IMPLEMENTED (Explainability Layer)
* `backend/risk_engine.py` - IMPLEMENTED (Heuristic Scoring)

## BACKEND (API)
* `backend/main.py` - IMPLEMENTED (FastAPI Endpoints)
* `backend/models.py` - IMPLEMENTED (Pydantic Schema Validation)

## FRONTEND (REACT/VITE)
* `frontend/src/App.tsx` - IMPLEMENTED (Main Dashboard & Filters)
* `frontend/src/components/ThermalMap.tsx` - IMPLEMENTED (Leaflet GIS)
* `frontend/src/components/EventPanel.tsx` - IMPLEMENTED (Investigation Workspace)
* `frontend/src/components/PriorityQueue.tsx` - IMPLEMENTED (Alert Triage)
* `frontend/src/components/EventHistory.tsx` - IMPLEMENTED (Recharts Trendline)

## TESTS
* `backend/test_pipeline.py` - TEST (Pytest Suite)
* `backend/validate_data.py` - TEST (Data Integrity Auditor)

## DOCUMENTATION & DEMO
* `ARCHITECTURE.md` - DOCUMENTATION
* `PROJECT_HEALTH.md` - DOCUMENTATION
* `ROADMAP.md` - FUTURE / DOCUMENTATION
* `SIH_3_MINUTE_SCRIPT.md` - PRESENTATION
* `SIH_BACKUP_DEMO.md` - DEMO
* `SIH_DEMO_CHEATSHEET.md` - DEMO
* `SIH_DEMO_CONTENT.md` - PRESENTATION
* `SIH_ELEVATOR_PITCH.md` - PRESENTATION
* `SIH_FINAL_6_SLIDES.md` - PRESENTATION
* `SIH_JUDGE_QA.md` - PRESENTATION
* `THERMOSENTRY_SYSTEM_FLOW.md` - PRESENTATION
