from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class IndustrialContext(BaseModel):
    distance_to_industry_km: Optional[float] = Field(None, description="Distance to nearest industrial activity in km")

class TemporalAnalysis(BaseModel):
    location_observation_count: Optional[int] = Field(None, description="Number of observations around this location")
    location_avg_frp: Optional[float] = Field(None, description="Average FRP around this location")
    persistent_activity: Optional[bool] = Field(None, description="Whether activity is persistent")
    frp_change_percent: Optional[float] = Field(None, description="Percentage change in FRP compared to local average")
    escalation_flag: Optional[bool] = Field(None, description="Whether the event shows signs of escalation")

class AnomalyAnalysis(BaseModel):
    anomaly_score: Optional[float] = Field(None, description="Raw anomaly score from Isolation Forest")
    is_anomalous: Optional[bool] = Field(None, description="Boolean indicating if it is considered anomalous")

class Evidence(BaseModel):
    evidence_list: List[str] = Field(default_factory=list, description="List of plain text evidence lines")
    observation_reliability: Optional[float] = Field(None, description="0-100 reliability score based on data availability and confidence")
    reliability_label: Optional[str] = Field(None, description="GOOD, PARTIAL, or LIMITED")

class RiskAssessment(BaseModel):
    anomaly_risk: Optional[float] = Field(None, description="0-100 normalized anomaly risk")
    proximity_risk: Optional[float] = Field(None, description="0-100 normalized proximity risk")
    risk_score: Optional[float] = Field(None, description="Combined prototype risk score 0-100")
    risk_level: Optional[str] = Field(None, description="CRITICAL, HIGH, MEDIUM, LOW")

class ThermalEvent(BaseModel):
    event_id: str
    latitude: float
    longitude: float
    observation_time: datetime
    satellite: str
    instrument: str
    bright_ti4: float
    bright_ti5: float
    frp: float
    confidence: str
    daynight: str
    status: str
    
    # Enrichment
    context: Optional[IndustrialContext] = None
    anomaly: Optional[AnomalyAnalysis] = None
    temporal: Optional[TemporalAnalysis] = None
    evidence: Optional[Evidence] = None
    risk: Optional[RiskAssessment] = None

class StatisticsResponse(BaseModel):
    total_active_events: int
    anomalous_events: int
    high_priority_events: int
    industrial_context_events: int
