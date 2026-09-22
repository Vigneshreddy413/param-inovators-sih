import type { ThermalEvent } from '../types';

interface Props {
  events: ThermalEvent[];
  onSelectEvent: (eventId: string) => void;
  selectedEventId: string | null;
}

function riskColor(level: string | null): string {
  switch (level) {
    case 'CRITICAL': return 'text-critical';
    case 'HIGH': return 'text-high';
    case 'MEDIUM': return 'text-medium';
    case 'LOW': return 'text-low';
    default: return 'text-text-dim';
  }
}

function riskDot(level: string | null): string {
  switch (level) {
    case 'CRITICAL': return 'bg-critical';
    case 'HIGH': return 'bg-high';
    case 'MEDIUM': return 'bg-medium';
    case 'LOW': return 'bg-low';
    default: return 'bg-text-dim';
  }
}

export default function PriorityQueue({ events, onSelectEvent, selectedEventId }: Props) {
  if (!events.length) {
    return (
      <div className="h-full flex items-center justify-center text-text-dim text-sm">
        No risk events available
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-2 border-b border-border flex-shrink-0">
        <h3 className="text-[11px] text-text-dim uppercase tracking-wider font-medium">Priority Queue</h3>
        <span className="text-[10px] text-text-dim">{events.length} events · sorted by risk score</span>
      </div>
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-text-dim uppercase tracking-wider border-b border-border">
              <th className="text-left px-4 py-2 font-medium">Event</th>
              <th className="text-left px-3 py-2 font-medium">Risk</th>
              <th className="text-right px-3 py-2 font-medium">Score</th>
              <th className="text-right px-3 py-2 font-medium">FRP</th>
              <th className="text-left px-3 py-2 font-medium">Satellite</th>
              <th className="text-right px-3 py-2 font-medium">Ind. Dist</th>
              <th className="text-left px-3 py-2 font-medium">Anomaly</th>
              <th className="text-left px-3 py-2 font-medium">Reliability</th>
              <th className="text-left px-4 py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr
                key={ev.event_id}
                onClick={() => onSelectEvent(ev.event_id)}
                className={`cursor-pointer border-b border-border/30 transition-colors hover:bg-surface-600 ${
                  selectedEventId === ev.event_id ? 'bg-surface-600' : ''
                }`}
              >
                <td className="px-4 py-1.5 font-mono font-medium text-text-primary">{ev.event_id}</td>
                <td className="px-3 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${riskDot(ev.risk?.risk_level ?? null)}`} />
                    <span className={riskColor(ev.risk?.risk_level ?? null)}>{ev.risk?.risk_level ?? '—'}</span>
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-text-secondary">
                  {ev.risk?.risk_score != null ? ev.risk.risk_score.toFixed(1) : '—'}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-text-secondary">
                  {ev.frp != null ? `${ev.frp}` : '—'}
                </td>
                <td className="px-3 py-1.5 text-text-secondary">{ev.satellite}/{ev.instrument}</td>
                <td className="px-3 py-1.5 text-right font-mono text-text-secondary">
                  {ev.context?.distance_to_industry_km != null
                    ? `${ev.context.distance_to_industry_km.toFixed(1)} km`
                    : '—'}
                </td>
                <td className="px-3 py-1.5">
                  {ev.anomaly?.is_anomalous ? (
                    <span className="text-high">⚠ Yes</span>
                  ) : (
                    <span className="text-text-dim">No</span>
                  )}
                </td>
                <td className="px-3 py-1.5">
                  <span className={
                    ev.evidence?.reliability_label === 'GOOD' ? 'text-good' :
                    ev.evidence?.reliability_label === 'PARTIAL' ? 'text-partial' :
                    'text-limited'
                  }>
                    {ev.evidence?.reliability_label ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-1.5 text-text-dim whitespace-nowrap">
                  {ev.observation_time?.replace('T', ' ').slice(0, 16)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
