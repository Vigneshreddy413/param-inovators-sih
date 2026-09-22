# THERMOSENTRY SYSTEM FLOW

**OBSERVE**  
`NASA FIRMS`  
*(Raw thermal anomaly observations from VIIRS/MODIS)*

↓

**ENRICH**  
`OSM + historical/context data`  
*(Spatial queries to determine distance to industrial footprints)*

↓

**ANALYZE**  
`Thermal fingerprint + anomaly detection`  
*(Unsupervised Isolation Forest to find statistical deviations from local industrial baselines)*

↓

**UNDERSTAND**  
`Temporal behavior + evidence`  
*(Assessing if the anomaly persists over time and assembling a human-readable evidence chain)*

↓

**PRIORITIZE**  
`Risk engine`  
*(Heuristic weighting [60/40] of Anomaly and Proximity scores into an actionable 0-100 scale)*

↓

**INVESTIGATE**  
`GIS dashboard`  
*(Map-based interface showing what changed, the evidence, and observation reliability)*

↓

**ACT**  
`Human analyst / authorized workflow`  
*(Analyst confirms, rejects, or reviews the event, exporting the structured JSON payload for downstream dispatch)*
