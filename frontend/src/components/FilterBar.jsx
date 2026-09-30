export default function FilterBar({ portals, activeSource, setActiveSource, sortBy, setSortBy, count, countBySource }) {
  return (
    <div className="flex flex-wrap items-center gap-2 justify-between mb-4 px-1">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSource("All")}
          className={`text-sm rounded-full px-3.5 py-1.5 transition-colors ${activeSource === "All" ? "bg-ink text-cream" : "glass text-ink/60 border border-white/50 hover:bg-white/70"}`}
        >
          All ({count})
        </button>
        {portals.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveSource(p.name)}
            className={`text-sm rounded-full px-3.5 py-1.5 transition-colors ${activeSource === p.name ? "bg-ink text-cream" : "glass text-ink/60 border border-white/50 hover:bg-white/70"}`}
          >
            {p.name} ({countBySource?.[p.name] ?? 0})
          </button>
        ))}
      </div>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="text-sm rounded-full glass border border-white/50 px-3 py-1.5 text-ink/70"
      >
        <option value="relevance">Sort: Relevance</option>
        <option value="latest">Sort: Latest</option>
        <option value="location">Sort: Location</option>
        <option value="experience">Sort: Experience</option>
      </select>
    </div>
  );
}
