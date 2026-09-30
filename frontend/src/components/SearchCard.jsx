import PortalSelector from "./PortalSelector";
import { IconSearch, IconClock, IconX } from "./icons";

const EXPERIENCE_LEVELS = ["Any", "Fresher", "1-3 years", "3-5 years", "5-8 years", "8+ years"];

export default function SearchCard({
  form, setForm, portals, selectedPortals, setSelectedPortals,
  onSearch, loading, error, recentSearches, onApplyRecent, onClearRecent,
}) {
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const togglePortal = (id) =>
    setSelectedPortals((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  return (
    <div id="search" className="glass rounded-[28px] border border-white/60 shadow-xl shadow-black/5 p-6 sm:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="space-y-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1.5 uppercase tracking-wide">Job role</label>
            <input
              value={form.role}
              onChange={update("role")}
              placeholder="e.g. AI Engineer"
              className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-coral/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1.5 uppercase tracking-wide">Experience</label>
            <select
              value={form.experience}
              onChange={update("experience")}
              className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-coral/40"
            >
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1.5 uppercase tracking-wide">Location</label>
            <input
              value={form.location}
              onChange={update("location")}
              placeholder="e.g. Chennai, or Remote"
              className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-coral/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 mb-1.5 uppercase tracking-wide">Skills / keywords</label>
            <input
              value={form.skills}
              onChange={update("skills")}
              placeholder="Python, ML, NLP"
              className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-coral/40"
            />
          </div>
        </div>

        {recentSearches?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink/40 flex items-center gap-1"><IconClock style={{ width: 12, height: 12 }} /> Recent:</span>
            {recentSearches.map((r, i) => (
              <button
                type="button"
                key={i}
                onClick={() => onApplyRecent(r)}
                className="text-xs bg-white/60 hover:bg-white/90 text-ink/60 rounded-full px-3 py-1 transition-colors"
              >
                {r.role}{r.location ? ` · ${r.location}` : ""}
              </button>
            ))}
            <button type="button" onClick={onClearRecent} className="text-ink/30 hover:text-ink/60" title="Clear recent searches">
              <IconX style={{ width: 12, height: 12 }} />
            </button>
          </div>
        )}

        <PortalSelector
          portals={portals}
          selected={selectedPortals}
          onToggle={togglePortal}
          onSelectAll={(ids) => setSelectedPortals(ids)}
          onClearAll={() => setSelectedPortals([])}
        />

        {error && (
          <p className="text-sm text-red-700 bg-red-50/80 border border-red-100 rounded-2xl px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto sm:px-9 py-3 rounded-full bg-ink text-cream font-medium flex items-center justify-center gap-2 shadow-lg shadow-ink/20 hover:bg-ink2 transition-colors disabled:opacity-60"
        >
          <IconSearch style={{ width: 16, height: 16 }} className="stroke-cream" />
          {loading ? "Searching…" : "Find Jobs"}
        </button>
      </form>
    </div>
  );
}
