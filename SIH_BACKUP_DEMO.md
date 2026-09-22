# THERMOSENTRY BACKUP DEMO PROCEDURE

*Use this if live internet or external APIs fail during the presentation.*

## Scenario
The project uses cached, real historical data for offline resilience. The frontend and backend communicate via `localhost`.

## Prerequisites
Ensure Python `.venv` is created and `npm install` was run in the frontend.

## Launch Commands (Offline / Local Mode)

**1. Start the Backend API:**
```bash
cd backend
.venv\Scripts\activate
uvicorn main:app --port 8000
```
*(This serves the previously processed real data from `data/thermosentry_risk.csv` locally without making outbound NASA/OSM calls)*

**2. Start the Frontend Dashboard:**
```bash
cd frontend
npm run dev
```

**3. Presenting without Map Tiles (If OSM tile server is blocked):**
- The Leaflet map will display a grey grid.
- **Pitch Pivot:** "Our map tiles are currently offline due to network isolation, but notice that our AI, Evidence Engine, and Risk Pipeline remain fully functional because our architecture separates the intelligence layer from the visualization layer."
- Proceed to click the **▶ Load Demo Event** button and present the Investigation Panel exactly as planned. No data is fabricated.
