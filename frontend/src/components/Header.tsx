export default function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-3 bg-surface-800 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-critical to-high flex items-center justify-center text-white font-bold text-sm">
          TS
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-wide text-text-primary">THERMOSENTRY</h1>
          <p className="text-[11px] text-text-dim tracking-wider uppercase">Satellite Thermal Intelligence</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-text-dim">
          <span className="w-2 h-2 rounded-full bg-good animate-pulse" />
          <span>LIVE</span>
        </div>
        <span className="text-[10px] text-text-dim px-2 py-1 bg-surface-700 rounded border border-border">
          SIH 2026 · PARAM INNOVATORS
        </span>
      </div>
    </header>
  );
}
