# THERMOSENTRY: SIH JUDGE Q&A

**1. What problem are you solving?**
We solve "alert fatigue" in satellite thermal detection. Raw data flags routine industrial flares alongside wildland fires. We filter the noise to highlight the true anomalies.

**2. Why NASA FIRMS?**
FIRMS provides free, globally accessible, near-real-time thermal anomaly data (VIIRS/MODIS), which is the gold standard for global thermal observation.

**3. What does your AI actually do?**
We use an unsupervised Isolation Forest algorithm. It evaluates Fire Radiative Power (FRP) and brightness temperatures *relative* to the proximity of industrial infrastructure to flag statistical deviations from the norm.

**4. How do you distinguish fire from other thermal sources?**
Through geospatial context. We dynamically query OpenStreetMap (OSM) to calculate the distance between the thermal event and known industrial/fossil-fuel infrastructure, feeding that context into our ML model.

**5. How do you detect persistent thermal sources?**
Our temporal engine groups observations by precise coordinates (rounded to a grid). If an area triggers thermal alerts repeatedly across time, we flag it as a persistent source rather than a new outbreak.

**6. How do you calculate risk?**
Risk is a heuristically weighted score combining the ML Anomaly Score (60%) and the Industrial Proximity Risk (40%), outputting an actionable 0-100 index.

**7. How do you handle missing satellite observations?**
We explicitly differentiate between "No Detection" and "No Recent Observation." The UI calculates an "Observation Reliability" label (GOOD, PARTIAL, LIMITED) to warn analysts when data gaps exist.

**8. How do you handle false positives?**
The UI includes a human-in-the-loop Analyst Investigation workflow, allowing an operator to review the evidence chain and manually flag an event as a "False Positive".

**9. Why is this different from simply viewing FIRMS?**
FIRMS is a visualization tool. THERMOSENTRY is an intelligence pipeline. We add anomaly detection, temporal tracking, evidence chains, and risk prioritization.

**10. What data sources are used?**
NASA FIRMS (VIIRS/MODIS data) and OpenStreetMap (OSM) via the Overpass API.

**11. Why OSM?**
It is free, continuously updated by the community, and provides rich semantic tags for industrial land use, which is critical for identifying flares and factories.

**12. Why use Isolation Forest?**
Without a heavily labeled dataset of "confirmed fires vs non-fires," we cannot use supervised learning. Isolation Forest is highly effective at unsupervised anomaly detection in multidimensional data.

**13. Why not use a deep neural network?**
DNNs require massive amounts of labeled training data. An unsupervised ML approach combined with explainable heuristics is vastly more appropriate, defensible, and reliable for this prototype stage.

**14. Where is your training dataset?**
The Isolation Forest model is fitted on the historical distribution of the ingested FIRMS data itself, dynamically learning what is "normal" for the ingested region.

**15. How will you validate the model?**
Validation requires partnering with local fire departments to compare our Risk Scores against actual historical emergency dispatch logs.

**16. Can it predict fires?**
No. It detects, enriches, and prioritizes existing thermal observations. It is an intelligence tool, not a predictive oracle.

**17. Can it continuously monitor every location?**
No, it is limited by the orbital pass frequency of polar-orbiting satellites like SUOMI-NPP and NOAA-20 (typically a few times a day).

**18. Can it control firefighting equipment?**
No. It outputs a structured JSON alert payload designed to be handed off to human dispatchers or automated emergency systems like n8n.

**19. How can this scale?**
The architecture (FastAPI + Python data pipelines) is stateless and easily containerized via Docker for horizontal scaling on cloud infrastructure.

**20. What happens if NASA FIRMS is unavailable?**
The pipeline would pause new ingestions, but the FastAPI backend and frontend dashboard would remain online to investigate the historically persisted events.

**21. What is your biggest current limitation?**
The temporal baseline is limited. The system needs to run for weeks to build a highly accurate "thermal fingerprint" of local industrial baseline behavior.

**22. How would this become production-ready?**
We would migrate data storage to PostGIS, implement Celery for asynchronous task queues, and acquire supervised training data to upgrade the Risk Engine.
