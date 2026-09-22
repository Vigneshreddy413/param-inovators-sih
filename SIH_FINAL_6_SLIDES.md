# SLIDE 1 — TITLE

**THERMOSENTRY**

**AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data**

**Team:** PARAM INNOVATORS  
**Problem Statement:** SIH26162  
**Organization:** National Technical Research Organisation (NTRO)  
**Category:** Software / Disaster Management  

---
# SLIDE 2 — IDEA / PROPOSED SOLUTION

**PROBLEM**  
Satellite thermal observations can reveal thermal anomalies, but analysts need additional context to determine:
- whether activity is unusual
- whether it persists
- whether it is changing
- whether industrial context exists
- how urgently it deserves investigation.

**SOLUTION**  
THERMOSENTRY combines:
NASA FIRMS + OSM/context + historical observations + thermal anomaly analysis + temporal analysis + risk prioritization + observation reliability  
...to create an analyst-oriented thermal intelligence layer.

**INNOVATION**  
1. Thermal Fingerprint / baseline
2. Observation-aware intelligence
3. Evidence Chain
4. Risk prioritization
5. Historical "What Changed?" analysis
6. Human-in-the-loop investigation.

---
# SLIDE 3 — TECHNICAL APPROACH

**Architecture:**
NASA FIRMS Satellite Thermal Observations
↓
Data Ingestion
↓
Quality / Observation Layer
↓
Geospatial Context (NASA FIRMS + OSM)
↓
Feature Engineering
↓
**THERMAL INTELLIGENCE**
├─ Thermal Fingerprint
├─ Anomaly Detection
├─ Temporal Analysis
└─ Evidence Engine
↓
Risk Engine
↓
FastAPI
↓
GIS Intelligence Dashboard
↓
Analyst / Alert Workflow

**Technology Stack:**
- Python
- FastAPI
- Pandas
- Scikit-learn (Isolation Forest)
- React / Vite / TypeScript
- Leaflet
- NASA FIRMS
- OSM / Overpass

---
# SLIDE 4 — FEASIBILITY & VIABILITY

**TECHNICAL FEASIBILITY**
- Uses accessible satellite-derived thermal observations
- Modular data pipeline
- API-first architecture
- GIS-based visualization
- scalable processing architecture

**OPERATIONAL FEASIBILITY**
- Analyst-oriented workflow
- prioritizes events
- provides evidence
- communicates observation limitations
- supports human review

**CHALLENGES**
- satellite revisit limitations
- cloud/observation gaps
- thermal-source ambiguity
- OSM completeness
- limited labelled data
- prototype thresholds

**MITIGATION**
- multi-temporal analysis
- observation reliability
- contextual enrichment
- explainable evidence
- human-in-loop
- future supervised learning with labelled datasets.

---
# SLIDE 5 — IMPACT & BENEFITS

**EARLIER INVESTIGATION**  
Prioritize suspicious thermal activity for analyst attention.

**REDUCED INFORMATION OVERLOAD**  
Rank events instead of presenting an undifferentiated hotspot list.

**BETTER CONTEXT**  
Combine thermal observations with industrial/geospatial context.

**TRACEABLE DECISIONS**  
Show why an event received its priority.

**UNCERTAINTY AWARENESS**  
Explicitly communicate observation gaps and reliability.

**SCALABILITY**  
Architecture can be extended to additional sensors, regions and enterprise data sources.

**FUTURE PROGRESSION:**  
larger labelled datasets + supervised classification + weather/context fusion + facility-specific baselines + production-scale geospatial infrastructure.

---
# SLIDE 6 — RESEARCH & REFERENCES

- **NASA FIRMS / Earthdata:** Primary source of VIIRS/MODIS raw thermal observation coordinate and Fire Radiative Power (FRP) telemetry.
- **OpenStreetMap / Overpass API:** Primary source of spatial context (landuse=industrial) to correlate thermal signatures with human infrastructure.
- **Scikit-learn Documentation:** Foundation for the Isolation Forest implementation used for unsupervised anomaly detection.
- **FastAPI Documentation:** Asynchronous python backend architecture standard.
- **Leaflet:** Open-source interactive mapping framework for rendering spatial GeoJSON intelligence data.
