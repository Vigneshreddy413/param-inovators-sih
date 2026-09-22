# SIH 2026: THERMOSENTRY PRESENTATION SCRIPT

## A. 30-Second Project Introduction
"Hello, we are team PARAM INNOVATORS presenting THERMOSENTRY for SIH Problem Statement 26162. 
THERMOSENTRY is an AI-assisted satellite intelligence platform. We transform raw NASA thermal observations into actionable, explainable intelligence to detect and classify industrial fires and persistent thermal anomalies."

## B. 60-Second Problem Explanation
"Currently, emergency responders and environmental monitors looking at raw satellite fire data (like NASA FIRMS) face a massive problem: false positives. 
A thermal detection could be a devastating forest fire, or it could just be a routine gas flare at a known oil refinery. Raw satellites don't know the difference.
When you receive hundreds of alerts a day with no context, alert fatigue sets in, and real disasters get missed."

## C. 90-Second Technical Workflow
"Our architecture solves this through an autonomous enrichment pipeline. 
First, we ingest live FIRMS data.
Second, we query OpenStreetMap spatially to find nearby industrial context.
Third, we feed this enriched data into an unsupervised Machine Learning Anomaly Detector—an Isolation Forest. It learns that high heat near a factory is normal, but that same heat in a forest is anomalous.
Finally, we run a Temporal Engine to track if the anomaly persists over time, and output a mathematically derived Risk Score."

## D. 90-Second Live Demonstration Script
**(Open Dashboard)** "Here is the live THERMOSENTRY intelligence dashboard. Today, the satellite detected 139 thermal spots in our region. But our AI filtered that down to just 11 High Priority events."
**(Click Demo Mode / Priority Queue)** "Let's investigate this critical event. The map automatically focuses, and our Investigation Workspace opens."
**(Point to Evidence Chain)** "Notice how the system doesn't just give a black-box score. It provides a vertical Evidence Chain: it proves the FRP is abnormal for the region, shows it's persistent, and maps it exactly 0.63km from an industrial facility."
**(Point to Reliability)** "Crucially, it also evaluates the satellite's observation reliability, so analysts know when there are data gaps."
**(Perform Action)** "I can confirm the alert or mark it as a false positive, and immediately copy the structured JSON payload to trigger an automated emergency response."

## E. 30-Second Innovation Explanation
"The core innovation is Contextual AI. We aren't just putting dots on a map. We are fusing multi-source geospatial data (Satellites + OSM land use) with Unsupervised Machine Learning and explainable heuristics to build a 'Thermal Fingerprint' of the earth, filtering out routine industrial noise."

## F. 30-Second Impact Explanation
"The impact is immediate resource optimization. By filtering out up to 80% of routine industrial noise, response teams only deploy to genuine unmapped anomalies. This saves fuel, money, and potentially lives by speeding up reaction times to true emergencies."

## G. Limitations
"We are transparent about our current prototype limitations. Because satellites (like VIIRS) only fly over a region a few times a day, we are limited by orbital physics—this is not continuous 24/7 CCTV. Additionally, without historical ground-truth dispatch logs, we rely on an unsupervised ML model rather than a supervised classifier."

## H. Future Scope
"Our roadmap includes ingesting geostationary satellite data for higher temporal frequency, integrating live weather and wind-vector data to predict fire spread, and eventually training a supervised Deep Neural Network once we acquire sufficient labeled dispatch data from fire departments."
