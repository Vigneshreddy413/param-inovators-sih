export interface IndustrialContext {
  distance_to_industry_km: number | null;
}

export interface AnomalyAnalysis {
  anomaly_score: number | null;
  is_anomalous: boolean | null;
}

export interface TemporalAnalysis {
  location_observation_count: number | null;
  location_avg_frp: number | null;
  persistent_activity: boolean | null;
  frp_change_percent: number | null;
  escalation_flag: boolean | null;
}

export interface Evidence {
  evidence_list: string[];
  observation_reliability: number | null;
  reliability_label: string | null;
}

export interface RiskAssessment {
  anomaly_risk: number | null;
  proximity_risk: number | null;
  risk_score: number | null;
  risk_level: string | null;
}

export interface ThermalEvent {
  event_id: string;
  latitude: number;
  longitude: number;
  observation_time: string;
  satellite: string;
  instrument: string;
  bright_ti4: number;
  bright_ti5: number;
  frp: number;
  confidence: string;
  daynight: string;
  status: string;
  context: IndustrialContext | null;
  anomaly: AnomalyAnalysis | null;
  temporal: TemporalAnalysis | null;
  evidence: Evidence | null;
  risk: RiskAssessment | null;
}

export interface Statistics {
  total_active_events: number;
  anomalous_events: number;
  high_priority_events: number;
  industrial_context_events: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    event_id: string;
    observation_time: string;
    satellite: string;
    frp: number | null;
    bright_ti4: number | null;
    status: string;
    is_anomalous: boolean;
    risk_level: string | null;
    risk_score: number | null;
    distance_to_industry_km: number | null;
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ReliabilityLabel = 'GOOD' | 'PARTIAL' | 'LIMITED';
export type AnalystVerdict = 'CONFIRMED' | 'FALSE_POSITIVE' | 'NEEDS_REVIEW' | null;
