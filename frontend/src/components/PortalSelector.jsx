export default function PortalSelector({ portals, selected, onToggle, onSelectAll, onClearAll }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Search on</span>
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={() => onSelectAll(portals.map((p) => p.id))} className="text-coral2 hover:underline">
            Select all
          </button>
          <button type="button" onClick={onClearAll} className="text-ink/40 hover:underline">
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {portals.map((p) => {
          const isChecked = selected.includes(p.id);
          return (
            <label
              key={p.id}
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm cursor-pointer transition-colors
                ${isChecked
                  ? (p.implemented ? "border-ink bg-ink text-cream" : "border-ink/50 bg-ink/70 text-cream")
                  : "border-white/70 bg-white/60 text-ink/60 hover:border-ink/30"}`}
            >
              <input type="checkbox" className="accent-coral" checked={isChecked} onChange={() => onToggle(p.id)} />
              <span className="truncate">{p.name}</span>
              <span
                className={`ml-auto w-1.5 h-1.5 rounded-full ${p.implemented ? "bg-emerald-400" : "bg-ink/25"}`}
                title={p.implemented ? "Live data" : "Restricted by ToS — returns no results"}
              />
            </label>
          );
        })}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-ink/40 pt-1 flex-wrap">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> live data
        <span className="w-1.5 h-1.5 rounded-full bg-ink/25 inline-block ml-3" /> restricted by portal's Terms of Service
      </p>
    </div>
  );
}
