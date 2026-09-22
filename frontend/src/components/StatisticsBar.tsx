import type { Statistics } from '../types';

interface Props {
  stats: Statistics | null;
  loading: boolean;
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="flex-1 min-w-[140px] bg-surface-700 rounded-lg px-4 py-3 border border-border">
      <p className="text-[11px] text-text-dim uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex-1 min-w-[140px] bg-surface-700 rounded-lg px-4 py-3 border border-border animate-pulse">
      <div className="h-3 w-20 bg-surface-500 rounded mb-2" />
      <div className="h-7 w-12 bg-surface-500 rounded" />
    </div>
  );
}

export default function StatisticsBar({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="flex gap-3 px-5 py-3 bg-surface-900">
        <Skeleton /><Skeleton /><Skeleton /><Skeleton />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex gap-3 px-5 py-3 bg-surface-900">
      <StatCard label="Active Events" value={stats.total_active_events} color="text-text-primary" />
      <StatCard label="Anomalous" value={stats.anomalous_events} color="text-high" />
      <StatCard label="High Priority" value={stats.high_priority_events} color="text-critical" />
      <StatCard label="Industrial Context" value={stats.industrial_context_events} color="text-accent" />
    </div>
  );
}
