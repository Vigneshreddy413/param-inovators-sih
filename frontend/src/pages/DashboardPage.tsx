import { useState, useEffect, useCallback } from 'react';
import '../index.css';
import 'leaflet/dist/leaflet.css';
import type { ThermalEvent, Statistics, GeoJSONCollection } from '../types';
import { getStatistics, getGeoJSON, getRiskEvents, getEvent } from '../api/client';
import Header from '../components/Header';
import StatisticsBar from '../components/StatisticsBar';
import ThermalMap from '../components/ThermalMap';
import EventPanel from '../components/EventPanel';
import PriorityQueue from '../components/PriorityQueue';

function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [geojson, setGeojson] = useState<GeoJSONCollection | null>(null);
  const [riskEvents, setRiskEvents] = useState<ThermalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ThermalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterAnomaly, setFilterAnomaly] = useState<string>('ALL');
  const [filterIndustry, setFilterIndustry] = useState<string>('ALL');
  const [filterPersistence, setFilterPersistence] = useState<string>('ALL');
  const [filterSatellite, setFilterSatellite] = useState<string>('ALL');
  const [filterReliability, setFilterReliability] = useState<string>('ALL');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [s, g, r] = await Promise.all([
          getStatistics(),
          getGeoJSON(),
          getRiskEvents(500),
        ]);
        setStats(s);
        setGeojson(g);
        setRiskEvents(r);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to connect to THERMOSENTRY API');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectEvent = useCallback(async (eventId: string) => {
    try {
      const ev = await getEvent(eventId);
      setSelectedEvent(ev);
      setPanelOpen(true);
    } catch {
      console.error('Failed to load event', eventId);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
    setSelectedEvent(null);
  }, []);

  // Apply filters
  const filteredEvents = riskEvents.filter(ev => {
    if (filterRisk !== 'ALL' && ev.risk?.risk_level !== filterRisk) return false;
    if (filterAnomaly === 'YES' && !ev.anomaly?.is_anomalous) return false;
    if (filterAnomaly === 'NO' && ev.anomaly?.is_anomalous) return false;
    if (filterIndustry === 'YES' && ev.context?.distance_to_industry_km == null) return false;
    if (filterIndustry === 'NO' && ev.context?.distance_to_industry_km != null) return false;
    if (filterPersistence === 'YES' && !ev.temporal?.persistent_activity) return false;
    if (filterPersistence === 'NO' && ev.temporal?.persistent_activity) return false;
    if (filterSatellite !== 'ALL' && ev.satellite !== filterSatellite) return false;
    if (filterReliability !== 'ALL' && ev.evidence?.reliability_label !== filterReliability) return false;
    return true;
  });

  const filteredGeojson = geojson ? {
    ...geojson,
    features: geojson.features.filter(f => {
      const p = f.properties;
      if (filterRisk !== 'ALL' && p.risk_level !== filterRisk) return false;
      if (filterAnomaly === 'YES' && !p.is_anomalous) return false;
      if (filterAnomaly === 'NO' && p.is_anomalous) return false;
      if (filterIndustry === 'YES' && p.distance_to_industry_km == null) return false;
      if (filterIndustry === 'NO' && p.distance_to_industry_km != null) return false;
      // Note: persistence and satellite might not be in geojson properties, we fallback if missing
      // Actually they aren't fully populated in geojson properties in current backend models for GeoJSON.
      // But we can filter riskEvents reliably. 
      return true;
    })
  } : null;

  const resetFilters = () => {
    setFilterRisk('ALL');
    setFilterAnomaly('ALL');
    setFilterIndustry('ALL');
    setFilterPersistence('ALL');
    setFilterSatellite('ALL');
    setFilterReliability('ALL');
  };

  if (error) {
    return (
      <div className="dashboard-shell h-full flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-surface-800 rounded-lg border border-border max-w-md">
            <div className="text-critical text-4xl mb-4">⚠</div>
            <h2 className="text-xl font-semibold mb-2">Backend Unavailable</h2>
            <p className="text-text-secondary text-sm mb-4">{error}</p>
            <p className="text-text-dim text-xs">Ensure FastAPI is running on port 8000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell h-full flex flex-col">
      <Header />
      <StatisticsBar stats={stats} loading={loading} />
      
      {/* Filters */}
      <div className="bg-surface-800 border-b border-border px-5 py-2 flex flex-wrap gap-4 text-xs items-center">
        <div className="flex items-center gap-2">
          <span className="text-text-dim uppercase tracking-wider">Risk:</span>
          <select className="bg-surface-700 border border-border rounded px-2 py-1 text-text-primary outline-none" value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
            <option value="ALL">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-dim uppercase tracking-wider">Anomaly:</span>
          <select className="bg-surface-700 border border-border rounded px-2 py-1 text-text-primary outline-none" value={filterAnomaly} onChange={e => setFilterAnomaly(e.target.value)}>
            <option value="ALL">Any</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-dim uppercase tracking-wider">Ind. Context:</span>
          <select className="bg-surface-700 border border-border rounded px-2 py-1 text-text-primary outline-none" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)}>
            <option value="ALL">Any</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-dim uppercase tracking-wider">Persistence:</span>
          <select className="bg-surface-700 border border-border rounded px-2 py-1 text-text-primary outline-none" value={filterPersistence} onChange={e => setFilterPersistence(e.target.value)}>
            <option value="ALL">Any</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-dim uppercase tracking-wider">Reliability:</span>
          <select className="bg-surface-700 border border-border rounded px-2 py-1 text-text-primary outline-none" value={filterReliability} onChange={e => setFilterReliability(e.target.value)}>
            <option value="ALL">Any</option>
            <option value="GOOD">Good</option>
            <option value="PARTIAL">Partial</option>
            <option value="LIMITED">Limited</option>
          </select>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => handleSelectEvent('TH-000107')} 
            className="text-critical hover:text-red-300 font-bold uppercase tracking-wider text-[10px] bg-critical/10 px-3 py-1 rounded border border-critical/30 transition-colors">
            ▶ Load Demo Event
          </button>
          <button 
            onClick={resetFilters} 
            className="text-text-dim hover:text-text-primary uppercase tracking-wider font-medium text-[10px] bg-surface-700 px-3 py-1 rounded border border-border transition-colors">
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Map */}
        <div className={`flex-1 relative transition-all duration-300 ${panelOpen ? 'w-[55%]' : 'w-full'}`}>
          <ThermalMap geojson={filteredGeojson} onSelectEvent={handleSelectEvent} selectedEventId={selectedEvent?.event_id || null} />
        </div>
        {/* Event panel */}
        {panelOpen && selectedEvent && (
          <div className="w-[45%] min-w-[380px] max-w-[520px] border-l border-border bg-surface-800 overflow-y-auto">
            <EventPanel event={selectedEvent} onClose={handleClosePanel} />
          </div>
        )}
      </div>
      {/* Priority queue */}
      <div className="h-[220px] border-t border-border bg-surface-800 overflow-hidden">
        <PriorityQueue events={filteredEvents} onSelectEvent={handleSelectEvent} selectedEventId={selectedEvent?.event_id || null} />
      </div>
    </div>
  );
}

export default DashboardPage;
