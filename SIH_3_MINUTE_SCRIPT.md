# THERMOSENTRY 3-MINUTE PRESENTATION SCRIPT

**0:00–0:25 | The Problem**  
"Emergency responders and intelligence analysts rely on satellite thermal observations, like NASA FIRMS, to spot fires. But raw satellite data creates massive information overload. An automated satellite doesn't know the difference between a devastating forest fire and a routine flare at an oil refinery. Analysts suffer from alert fatigue because they lack context."

**0:25–0:55 | The Solution**  
"That is why we built THERMOSENTRY. THERMOSENTRY is an AI-assisted satellite thermal intelligence platform. It doesn't just put dots on a map. It adds an intelligence layer that learns what normal looks like, identifies what changed, explains why it matters, and tells the analyst what needs attention first."

**0:55–1:25 | Technical Approach**  
"Our pipeline ingests raw FIRMS data and instantly queries OpenStreetMap for industrial context. It feeds this spatial data into an Unsupervised Machine Learning model—an Isolation Forest. This model dynamically flags thermal anomalies based on local industrial footprints, rather than hardcoded rules. We then pass this through a Temporal Engine and a Risk Engine to output a prioritized list."

**1:25–2:20 | LIVE DEMO**  
*(Open Dashboard)* "Here is the THERMOSENTRY dashboard. Today, FIRMS observed 139 thermal events, but we've filtered the noise down to just 11 critical anomalies."  
*(Click Load Demo Event)* "Let's investigate this critical event. The map automatically focuses. On the right, the Evidence Chain explicitly explains the AI's logic: it found abnormal FRP and mapped it 0.6 kilometers from an industrial zone."  
*(Point to History & Reliability)* "It also shows historical escalation—what changed—and explicitly states the satellite's observation reliability so analysts aren't misled by data gaps."

**2:20–2:45 | Innovation & Human Action**  
"This is contextual AI. And because AI shouldn't make unilateral emergency decisions, we implemented a human-in-the-loop workflow. The analyst reviews the evidence, clicks 'Confirm', and dispatches the structured JSON payload to emergency teams instantly."

**2:45–3:00 | Impact + Closing**  
"By stripping away routine noise and providing explainable evidence, we save time, optimize resources, and combat alert fatigue. THERMOSENTRY turns raw satellite thermal observations into explainable, prioritized intelligence for analysts. Thank you."
