import { useEffect, useState } from 'react';
import type { ThermalEvent } from '../types';
import { getEventHistory } from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  eventId: string;
}

export default function EventHistory({ eventId }: Props) {
  const [history, setHistory] = useState<ThermalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getEventHistory(eventId);
        // Sort chronologically
        const sorted = data.sort((a, b) => new Date(a.observation_time).getTime() - new Date(b.observation_time).getTime());
        setHistory(sorted);
      } catch (e) {
        console.error('Failed to load history', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  if (loading) {
    return <div className="text-text-dim text-xs py-4 text-center animate-pulse">Loading history...</div>;
  }

  if (history.length <= 1) {
    return (
      <div className="bg-surface-700 rounded-lg p-4 border border-border text-center">
        <p className="text-text-dim text-xs">Limited historical observations — trend confidence is reduced.</p>
        <p className="text-text-secondary text-[10px] mt-1">Single observation recorded.</p>
      </div>
    );
  }

  const chartData = history.map(h => ({
    time: h.observation_time.replace('T', ' ').slice(0, 16),
    frp: h.frp ?? 0
  }));

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  
  const frpChange = latest.frp != null && previous.frp != null && previous.frp > 0
    ? ((latest.frp - previous.frp) / previous.frp) * 100 
    : null;

  let whatChangedText = "Observation repeated";
  if (frpChange != null) {
    if (frpChange > 5) whatChangedText = "FRP increased";
    else if (frpChange < -5) whatChangedText = "FRP decreased";
    else whatChangedText = "Persistent thermal activity";
  }

  return (
    <div className="bg-surface-700 rounded-lg p-3 border border-border">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[11px] text-text-dim uppercase tracking-wider">What Changed?</p>
        <div className="text-right">
          <p className="text-[10px] text-text-dim">Observations</p>
          <p className="text-sm text-text-primary font-mono">{history.length}</p>
        </div>
      </div>
      
      <div className="mb-4 flex flex-col gap-1">
        <span className="text-xs text-text-primary font-medium">{whatChangedText}</span>
        {frpChange != null && (
          <span className={`text-[11px] font-mono ${frpChange > 0 ? 'text-critical' : 'text-good'}`}>
            {frpChange > 0 ? '▲' : '▼'} {Math.abs(frpChange).toFixed(1)}% change from previous
          </span>
        )}
      </div>

      <div className="h-32 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10} 
              tickFormatter={(t) => t.split(' ')[1]} // show just time
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickFormatter={(v) => `${v}`}
              width={30}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f1420', borderColor: '#1e293b', fontSize: '11px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Line 
              type="monotone" 
              dataKey="frp" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
              name="FRP (MW)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
