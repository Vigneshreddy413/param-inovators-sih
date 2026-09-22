import { useState, useEffect } from 'react';
import type { ThermalEvent } from '../types';
import EventHistory from './EventHistory';

interface Props {
  event: ThermalEvent;
  onClose: () => void;
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${color}`}>
      {text}
    </span>
  );
}

function riskBadge(level: string | null) {
  switch (level) {
    case 'CRITICAL': return <Badge text="CRITICAL" color="bg-critical/20 text-critical" />;
    case 'HIGH': return <Badge text="HIGH" color="bg-high/20 text-high" />;
    case 'MEDIUM': return <Badge text="MEDIUM" color="bg-medium/20 text-medium" />;
    case 'LOW': return <Badge text="LOW" color="bg-low/20 text-low" />;
    default: return <Badge text="UNKNOWN" color="bg-surface-500 text-text-dim" />;
  }
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50">
      <span className="text-[11px] text-text-dim uppercase tracking-wider">{label}</span>
      <span className="text-sm text-text-primary font-mono text-right">{value ?? 'N/A'}</span>
    </div>
  );
}

export default function EventPanel({ event: e, onClose }: Props) {
  const [note, setNote] = useState('');
  const [action, setAction] = useState<string | null>(null);

  // Load local storage on mount/event change
  useEffect(() => {
    const savedNote = localStorage.getItem(`note_${e.event_id}`);
    const savedAction = localStorage.getItem(`action_${e.event_id}`);
    setNote(savedNote || '');
    setAction(savedAction || null);
  }, [e.event_id]);

  const handleSaveAction = (act: string) => {
    setAction(act);
    localStorage.setItem(`action_${e.event_id}`, act);
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    localStorage.setItem(`note_${e.event_id}`, val);
  };

  const risk = e.risk;
  const anomaly = e.anomaly;
  const temporal = e.temporal;
  const evidence = e.evidence;

  // Recommended Action
  let recAction = "Routine monitoring.";
  if (risk?.risk_level === 'CRITICAL') recAction = "Immediate analyst review recommended.";
  if (risk?.risk_level === 'HIGH') recAction = "Priority investigation recommended.";
  if (risk?.risk_level === 'MEDIUM') recAction = "Continue monitoring and review supporting context.";

  // Data Quality
  let qualityText = "Observation gaps reduce confidence in temporal assessment.";
  let qualityColor = "text-limited border-limited/30 bg-limited/10";
  if (evidence?.reliability_label === 'GOOD') {
    qualityText = "Observation data sufficient for current assessment.";
    qualityColor = "text-good border-good/30 bg-good/10";
  } else if (evidence?.reliability_label === 'PARTIAL') {
    qualityText = "Some contextual observations are unavailable.";
    qualityColor = "text-partial border-partial/30 bg-partial/10";
  }

  // Alert payload
  const alertPayload = JSON.stringify({
    event_id: e.event_id,
    timestamp: e.observation_time,
    latitude: e.latitude,
    longitude: e.longitude,
    risk_level: risk?.risk_level,
    risk_score: risk?.risk_score,
    anomaly: anomaly?.is_anomalous,
    persistence: temporal?.persistent_activity,
    industrial_context: e.context?.distance_to_industry_km != null,
    observation_reliability: evidence?.reliability_label,
    recommended_action: recAction
  }, null, 2);

  const copyAlert = () => {
    navigator.clipboard.writeText(alertPayload);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-text-dim uppercase tracking-wider mb-1">Investigation Workspace</p>
          <h2 className="text-lg font-semibold font-mono text-text-primary leading-tight">{e.event_id}</h2>
        </div>
        <button onClick={onClose} className="text-text-dim hover:text-text-primary text-2xl leading-none p-1">×</button>
      </div>

      {/* Data Quality Banner */}
      <div className={`p-2 rounded border text-[11px] ${qualityColor} flex items-center gap-2`}>
        <span className="font-bold">{evidence?.reliability_label ?? 'UNKNOWN'}:</span> {qualityText}
      </div>

      {/* Recommended Action */}
      <div className="bg-surface-700 rounded-lg p-3 border border-border">
        <p className="text-[11px] text-text-dim uppercase tracking-wider mb-1">Recommended Action</p>
        <p className={`text-sm ${risk?.risk_level === 'CRITICAL' || risk?.risk_level === 'HIGH' ? 'text-critical' : 'text-text-primary'}`}>
          {recAction}
        </p>
      </div>

      {/* Evidence Chain */}
      <div className="bg-surface-700 rounded-lg p-3 border border-border">
        <p className="text-[11px] text-text-dim uppercase tracking-wider mb-3">Evidence Chain</p>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border bg-surface-800 text-text-dim text-[10px] z-10 font-bold shrink-0">1</div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-surface-800 p-2 rounded border border-border/50">
              <p className="text-[10px] text-text-dim uppercase mb-1">Thermal Observation</p>
              <p className="text-xs text-text-primary font-mono">{e.frp != null ? `${e.frp} MW` : 'No FRP'} (Sat: {e.satellite})</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border bg-surface-800 text-text-dim text-[10px] z-10 font-bold shrink-0">2</div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-surface-800 p-2 rounded border border-border/50">
              <p className="text-[10px] text-text-dim uppercase mb-1">Anomaly State</p>
              <p className={`text-xs ${anomaly?.is_anomalous ? 'text-high' : 'text-text-primary'}`}>
                {anomaly?.is_anomalous ? `FRP/Brightness abnormal for region (Score: ${anomaly?.anomaly_score?.toFixed(2)})` : 'Normal expected behavior'}
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border bg-surface-800 text-text-dim text-[10px] z-10 font-bold shrink-0">3</div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-surface-800 p-2 rounded border border-border/50">
              <p className="text-[10px] text-text-dim uppercase mb-1">Temporal Behavior</p>
              <p className="text-xs text-text-primary">
                {temporal?.persistent_activity ? `${temporal?.location_observation_count} observations (Persistent)` : 'Isolated event'}
              </p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-border bg-surface-800 text-text-dim text-[10px] z-10 font-bold shrink-0">4</div>
            <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2rem)] bg-surface-800 p-2 rounded border border-border/50">
              <p className="text-[10px] text-text-dim uppercase mb-1">Industrial Context</p>
              <p className="text-xs text-text-primary">
                {e.context?.distance_to_industry_km != null 
                  ? `Industrial context detected (${e.context.distance_to_industry_km.toFixed(1)} km away)` 
                  : 'No mapped industrial context found within search radius'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Risk Explanation */}
      <div className="bg-surface-700 rounded-lg p-3 border border-border">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[11px] text-text-dim uppercase tracking-wider mb-1">Risk Assessment</p>
            <div className="flex items-center gap-2">
              {riskBadge(risk?.risk_level ?? null)}
              <span className="text-xs text-text-dim italic">Prototype decision-support score</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-dim uppercase">Score</p>
            <p className="text-xl font-mono text-text-primary">{risk?.risk_score != null ? risk.risk_score.toFixed(1) : 'N/A'}</p>
          </div>
        </div>

        <p className="text-[10px] text-text-dim uppercase mb-2 border-b border-border/50 pb-1">Contributing Factors</p>
        <Field label="Thermal Anomaly Risk" value={risk?.anomaly_risk != null ? `${risk.anomaly_risk.toFixed(1)} (60% weight)` : 'N/A'} />
        <Field label="Industrial Proximity Risk" value={risk?.proximity_risk != null ? `${risk.proximity_risk.toFixed(1)} (40% weight)` : 'N/A'} />
        <Field label="Observation Reliability" value={evidence?.observation_reliability != null ? `${evidence.observation_reliability}/100` : 'N/A'} />
      </div>

      {/* History Timeline */}
      <EventHistory eventId={e.event_id} />

      {/* Event Details */}
      <div className="bg-surface-700 rounded-lg p-3 border border-border">
        <p className="text-[11px] text-text-dim uppercase tracking-wider mb-2">Raw Observation Details</p>
        <Field label="Coordinates" value={`${e.latitude.toFixed(4)}, ${e.longitude.toFixed(4)}`} />
        <Field label="Time" value={e.observation_time?.replace('T', ' ')} />
        <Field label="Instrument" value={e.instrument} />
        <Field label="Brightness T4" value={e.bright_ti4 != null ? `${e.bright_ti4} K` : null} />
        <Field label="Brightness T5" value={e.bright_ti5 != null ? `${e.bright_ti5} K` : null} />
        <Field label="Confidence" value={e.confidence?.toUpperCase()} />
        <Field label="Day/Night" value={e.daynight === 'D' ? 'Day' : 'Night'} />
      </div>

      {/* Alert Payload */}
      <div className="bg-surface-700 rounded-lg p-3 border border-border">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[11px] text-text-dim uppercase tracking-wider">Alert Payload JSON</p>
          <button onClick={copyAlert} className="text-[10px] bg-surface-600 hover:bg-surface-500 px-2 py-1 rounded text-text-primary border border-border">Copy</button>
        </div>
        <pre className="text-[10px] text-text-secondary overflow-x-auto bg-surface-800 p-2 rounded border border-border">
          {alertPayload}
        </pre>
      </div>

      {/* Analyst Action */}
      <div className="bg-surface-700 rounded-lg p-3 border border-border">
        <p className="text-[11px] text-text-dim uppercase tracking-wider mb-3">Analyst Action</p>
        <div className="flex gap-2 mb-3">
          <button 
            onClick={() => handleSaveAction('CONFIRM')}
            className={`flex-1 text-[10px] uppercase font-bold py-2 rounded transition-colors border ${action === 'CONFIRM' ? 'bg-critical/20 text-critical border-critical' : 'bg-surface-800 text-text-dim border-border hover:bg-surface-600'}`}>
            Confirm
          </button>
          <button 
            onClick={() => handleSaveAction('FALSE POSITIVE')}
            className={`flex-1 text-[10px] uppercase font-bold py-2 rounded transition-colors border ${action === 'FALSE POSITIVE' ? 'bg-good/20 text-good border-good' : 'bg-surface-800 text-text-dim border-border hover:bg-surface-600'}`}>
            False Positive
          </button>
          <button 
            onClick={() => handleSaveAction('NEEDS REVIEW')}
            className={`flex-1 text-[10px] uppercase font-bold py-2 rounded transition-colors border ${action === 'NEEDS REVIEW' ? 'bg-medium/20 text-medium border-medium' : 'bg-surface-800 text-text-dim border-border hover:bg-surface-600'}`}>
            Needs Review
          </button>
        </div>
        <p className="text-[10px] text-text-dim mb-1">Investigation Notes (Prototype Local Storage)</p>
        <textarea 
          className="w-full bg-surface-800 border border-border rounded p-2 text-xs text-text-primary outline-none focus:border-text-dim transition-colors resize-none"
          rows={3}
          placeholder="e.g. Requires ground verification..."
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
        />
      </div>

    </div>
  );
}
