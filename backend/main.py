from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from typing import List, Dict, Any
from models import (
    ThermalEvent, IndustrialContext, TemporalAnalysis,
    AnomalyAnalysis, Evidence, RiskAssessment, StatisticsResponse
)

app = FastAPI(title="THERMOSENTRY API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
EVIDENCE_FILE = os.path.join(DATA_DIR, "thermosentry_evidence.csv")
RISK_FILE = os.path.join(DATA_DIR, "thermosentry_risk.csv")

def get_merged_data() -> pd.DataFrame:
    """Loads and merges evidence and risk data to provide a unified view."""
    if not os.path.exists(EVIDENCE_FILE) or not os.path.exists(RISK_FILE):
        return pd.DataFrame()
    
    evidence_df = pd.read_csv(EVIDENCE_FILE)
    risk_df = pd.read_csv(RISK_FILE)
    
    # Merge on event_id. Using left join just in case, but they should be 1:1 if pipeline ran fully
    merged_df = pd.merge(
        evidence_df,
        risk_df[["event_id", "anomaly_risk", "proximity_risk", "risk_score", "risk_level"]],
        on="event_id",
        how="left"
    )
    return merged_df

def map_row_to_event(row: pd.Series) -> ThermalEvent:
    # Handle NaN values by converting them to None for JSON serialization
    row = row.where(pd.notnull(row), None)
    
    return ThermalEvent(
        event_id=row["event_id"],
        latitude=row["latitude"],
        longitude=row["longitude"],
        observation_time=pd.to_datetime(row["observation_time"]),
        satellite=row.get("satellite", "Unknown"),
        instrument=row.get("instrument", "Unknown"),
        bright_ti4=row.get("bright_ti4", 0.0),
        bright_ti5=row.get("bright_ti5", 0.0),
        frp=row.get("frp", 0.0),
        confidence=str(row.get("confidence", "")),
        daynight=str(row.get("daynight", "")),
        status=str(row.get("status", "UNCLASSIFIED")),
        context=IndustrialContext(
            distance_to_industry_km=row.get("distance_to_industry_km")
        ),
        anomaly=AnomalyAnalysis(
            anomaly_score=row.get("anomaly_score"),
            is_anomalous=row.get("is_anomalous")
        ),
        temporal=TemporalAnalysis(
            location_observation_count=row.get("location_observation_count"),
            location_avg_frp=row.get("location_avg_frp"),
            persistent_activity=row.get("persistent_activity"),
            frp_change_percent=row.get("frp_change_percent"),
            escalation_flag=row.get("escalation_flag")
        ),
        evidence=Evidence(
            evidence_list=str(row.get("evidence", "")).split(" | ") if row.get("evidence") else [],
            observation_reliability=row.get("observation_reliability"),
            reliability_label=row.get("reliability_label")
        ),
        risk=RiskAssessment(
            anomaly_risk=row.get("anomaly_risk"),
            proximity_risk=row.get("proximity_risk"),
            risk_score=row.get("risk_score"),
            risk_level=row.get("risk_level")
        )
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "THERMOSENTRY"}

@app.get("/events", response_model=List[ThermalEvent])
def get_events(limit: int = 100):
    df = get_merged_data()
    if df.empty:
        return []
    
    # Sort by observation time descending
    df = df.sort_values(by="observation_time", ascending=False).head(limit)
    events = [map_row_to_event(row) for _, row in df.iterrows()]
    return events

def safe_float(val):
    if pd.isna(val): return None
    try:
        f = float(val)
        import math
        if math.isnan(f): return None
        return f
    except:
        return None

@app.get("/events/geojson")
def get_events_geojson():
    df = get_merged_data()
    if df.empty:
        return {"type": "FeatureCollection", "features": []}
    
    features = []
    for _, row in df.iterrows():
        properties = {
            "event_id": row["event_id"],
            "observation_time": str(row["observation_time"]),
            "satellite": row.get("satellite"),
            "frp": safe_float(row.get("frp")),
            "bright_ti4": safe_float(row.get("bright_ti4")),
            "status": row.get("status"),
            "is_anomalous": bool(row.get("is_anomalous")) if pd.notna(row.get("is_anomalous")) else False,
            "risk_level": row.get("risk_level") if pd.notna(row.get("risk_level")) else None,
            "risk_score": safe_float(row.get("risk_score")),
            "distance_to_industry_km": safe_float(row.get("distance_to_industry_km"))
        }
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    safe_float(row.get("longitude")) or 0.0, 
                    safe_float(row.get("latitude")) or 0.0
                ]
            },
            "properties": properties
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/events/{event_id}", response_model=ThermalEvent)
def get_event(event_id: str):
    df = get_merged_data()
    if df.empty:
        raise HTTPException(status_code=404, detail="Data not found")
        
    event_row = df[df["event_id"] == event_id]
    if event_row.empty:
        raise HTTPException(status_code=404, detail="Event not found")
        
    return map_row_to_event(event_row.iloc[0])

@app.get("/events/{event_id}/evidence", response_model=Evidence)
def get_event_evidence(event_id: str):
    df = get_merged_data()
    event_row = df[df["event_id"] == event_id]
    if event_row.empty:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event = map_row_to_event(event_row.iloc[0])
    return event.evidence

@app.get("/events/{event_id}/history")
def get_event_history(event_id: str):
    df = get_merged_data()
    event_row = df[df["event_id"] == event_id]
    if event_row.empty:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Find all events in the same location group
    loc_group = event_row.iloc[0].get("location_group")
    if pd.isna(loc_group):
        return []
        
    history_df = df[df["location_group"] == loc_group].sort_values(by="observation_time")
    events = [map_row_to_event(row) for _, row in history_df.iterrows()]
    return events

@app.get("/statistics", response_model=StatisticsResponse)
def get_statistics():
    df = get_merged_data()
    if df.empty:
        return StatisticsResponse(
            total_active_events=0,
            anomalous_events=0,
            high_priority_events=0,
            industrial_context_events=0
        )
        
    total_active = len(df)
    anomalous = int(df["is_anomalous"].sum()) if "is_anomalous" in df else 0
    
    high_priority = 0
    if "risk_level" in df:
        high_priority = len(df[df["risk_level"].isin(["CRITICAL", "HIGH"])])
        
    industrial_context = 0
    if "distance_to_industry_km" in df:
        industrial_context = len(df[df["distance_to_industry_km"] <= 3.0])
        
    return StatisticsResponse(
        total_active_events=total_active,
        anomalous_events=anomalous,
        high_priority_events=high_priority,
        industrial_context_events=industrial_context
    )

@app.get("/risk-events", response_model=List[ThermalEvent])
def get_risk_events(limit: int = 50):
    df = get_merged_data()
    if df.empty:
        return []
        
    if "risk_score" in df:
        # Sort by risk score descending
        df = df.sort_values(by="risk_score", ascending=False).head(limit)
        
    events = [map_row_to_event(row) for _, row in df.iterrows()]
    return events
