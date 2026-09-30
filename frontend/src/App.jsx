import { useEffect, useState, useMemo } from "react";
import SearchCard from "./components/SearchCard";
import JobCard from "./components/JobCard";
import JobModal from "./components/JobModal";
import FilterBar from "./components/FilterBar";
import SourceNotes from "./components/SourceNotes";
import { IconLogo, IconSearch, IconGrid, IconCheck, IconBookmark } from "./components/icons";
import { usePersistentState } from "./hooks/usePersistentState";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
}

export default function App() {
  const [portals, setPortals] = useState([]);
  const [selectedPortals, setSelectedPortals] = useState([]);
  const [form, setForm] = useState({ role: "", experience: "Any", location: "", skills: "" });

  const [jobs, setJobs] = useState([]);
  const [sourceNotes, setSourceNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [activeSource, setActiveSource] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [openJob, setOpenJob] = useState(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [appliedUrls, setAppliedUrls] = usePersistentState("roleboard:applied", []);
  const [savedJobs, setSavedJobs] = usePersistentState("roleboard:saved", []); // array of job objects
  const [recentSearches, setRecentSearches] = usePersistentState("roleboard:recent", []);

  useEffect(() => {
    fetch("/api/portals")
      .then((r) => r.json())
      .then((data) => {
        setPortals(data);
        setSelectedPortals(data.filter((p) => p.implemented).map((p) => p.id));
      })
      .catch(() => setError("Couldn't load the list of job portals. Is the backend running?"));
  }, []);

  const runSearch = async (overrideForm) => {
    const activeForm = overrideForm || form;
    setError("");
    setShowSavedOnly(false);
    if (!activeForm.role.trim()) {
      setError("Please enter a job role to search for.");
      return;
    }
    if (selectedPortals.length === 0) {
      setError("Select at least one job portal to search.");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeForm, portals: selectedPortals, sort_by: sortBy }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong while searching.");
        setJobs([]);
        setSourceNotes({});
        return;
      }
      setJobs(data.jobs || []);
      setSourceNotes(data.source_notes || {});
      setActiveSource("All");

      // remember this search (dedup by role+location, keep newest 5)
      setRecentSearches((prev) => {
        const key = (r) => `${r.role.toLowerCase()}|${r.location.toLowerCase()}`;
        const withoutDup = prev.filter((r) => key(r) !== key(activeForm));
        return [{ role: activeForm.role, location: activeForm.location }, ...withoutDup].slice(0, 5);
      });
    } catch {
      setError("Couldn't reach the backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const applyRecent = (r) => {
    const nextForm = { ...form, role: r.role, location: r.location };
    setForm(nextForm);
    runSearch(nextForm);
  };

  const markApplied = (job) => {
    setAppliedUrls((prev) => (prev.includes(job.url) ? prev : [...prev, job.url]));
  };

  const toggleSave = (job) => {
    setSavedJobs((prev) => {
      const exists = prev.some((j) => j.url === job.url);
      return exists ? prev.filter((j) => j.url !== job.url) : [...prev, job];
    });
  };

  const filteredJobs = useMemo(() => {
    const base = showSavedOnly ? savedJobs : jobs;
    if (activeSource === "All") return base;
    return base.filter((j) => j.source === activeSource);
  }, [jobs, savedJobs, showSavedOnly, activeSource]);

  const usedPortals = useMemo(() => {
    const pool = showSavedOnly ? savedJobs : jobs;
    const names = new Set(pool.map((j) => j.source));
    return portals.filter((p) => names.has(p.name));
  }, [jobs, savedJobs, showSavedOnly, portals]);

  const countBySource = useMemo(() => {
    const pool = showSavedOnly ? savedJobs : jobs;
    const counts = {};
    for (const j of pool) counts[j.source] = (counts[j.source] || 0) + 1;
    return counts;
  }, [jobs, savedJobs, showSavedOnly]);

  const savedSet = useMemo(() => new Set(savedJobs.map((j) => j.url)), [savedJobs]);
  const today = new Date();

  return (
    <div className="mesh-bg font-sans">
      {/* floating icon rail (desktop) */}
      <nav className="hidden md:flex flex-col items-center gap-1 fixed left-5 top-1/2 -translate-y-1/2 z-30 glass-strong rounded-full py-4 px-2.5 shadow-lg shadow-black/5 border border-white/60">
        <a href="#top" className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center mb-1" title="Home">
          <IconGrid style={{ width: 16, height: 16 }} className="stroke-cream" />
        </a>
        <a href="#search" className="w-9 h-9 rounded-full flex items-center justify-center text-ink/60 hover:bg-white/70" title="Search">
          <IconSearch style={{ width: 16, height: 16 }} />
        </a>
        <button
          onClick={() => { setShowSavedOnly((v) => !v); document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }); }}
          className={`w-9 h-9 rounded-full flex items-center justify-center ${showSavedOnly ? "bg-coral/20 text-coral2" : "text-ink/60 hover:bg-white/70"}`}
          title={`Saved jobs (${savedJobs.length})`}
        >
          <IconBookmark filled={showSavedOnly} style={{ width: 16, height: 16 }} />
        </button>
      </nav>

      {/* top glass nav */}
      <header id="top" className="sticky top-4 z-20 mx-auto max-w-3xl px-4">
        <div className="glass-strong rounded-full px-5 py-2.5 flex items-center gap-5 shadow-lg shadow-black/5 border border-white/60 mt-4">
          <span className="font-display text-ink font-medium flex items-center gap-1.5">
            <IconLogo style={{ width: 17, height: 17 }} /> Roleboard
          </span>
          <a className="text-sm text-ink/60 hover:text-ink hidden sm:inline" href="#search">Search</a>
          <a className="text-sm text-ink/60 hover:text-ink hidden sm:inline" href="#results">Results</a>
          <button
            onClick={() => setShowSavedOnly((v) => !v)}
            className="ml-auto text-xs text-coral2 bg-coral/10 border border-coral/20 rounded-full px-3 py-1 flex items-center gap-1"
          >
            <IconBookmark filled={showSavedOnly} style={{ width: 12, height: 12 }} />
            {savedJobs.length} saved
          </button>
          {appliedUrls.length > 0 && (
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center gap-1">
              <IconCheck style={{ width: 12, height: 12 }} /> {appliedUrls.length} applied
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-10 pb-16 space-y-8">
        <div className="px-2">
          <p className="text-ink/50 text-sm mb-1">{DAY_NAMES[today.getDay()]}, {today.toLocaleDateString(undefined, { day: "numeric", month: "long" })}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink">
            {greeting()} <span className="text-ink/40">Let's find your next role.</span>
          </h1>
        </div>

        <SearchCard
          form={form}
          setForm={setForm}
          portals={portals}
          selectedPortals={selectedPortals}
          setSelectedPortals={setSelectedPortals}
          onSearch={() => runSearch()}
          loading={loading}
          error={error}
          recentSearches={recentSearches}
          onApplyRecent={applyRecent}
          onClearRecent={() => setRecentSearches([])}
        />

        {/* <SourceNotes notes={sourceNotes} /> */}

        {loading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl border border-white/60 p-5 h-40 space-y-3">
                <div className="skeleton h-4 w-2/3 rounded-full" />
                <div className="skeleton h-3 w-1/3 rounded-full" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && !showSavedOnly && jobs.length === 0 && !error && (
          <div className="text-center py-16 text-ink/50">
            <p className="text-lg">No jobs found for that search.</p>
            <p className="text-sm mt-1">Try a broader role, fewer skills, or more portals.</p>
          </div>
        )}

        {!loading && showSavedOnly && savedJobs.length === 0 && (
          <div className="text-center py-16 text-ink/50">
            <p className="text-lg">No saved jobs yet.</p>
            <p className="text-sm mt-1">Tap the bookmark icon on any job to save it for later.</p>
          </div>
        )}

        {!loading && (jobs.length > 0 || (showSavedOnly && savedJobs.length > 0)) && (
          <div id="results">
            {showSavedOnly && (
              <p className="text-sm text-coral2 mb-3 flex items-center gap-1.5">
                <IconBookmark filled style={{ width: 13, height: 13 }} /> Showing saved jobs only —
                <button onClick={() => setShowSavedOnly(false)} className="underline">back to search results</button>
              </p>
            )}
            <FilterBar
              portals={usedPortals}
              activeSource={activeSource}
              setActiveSource={setActiveSource}
              sortBy={sortBy}
              setSortBy={setSortBy}
              count={showSavedOnly ? savedJobs.length : jobs.length}
              countBySource={countBySource}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredJobs.map((job, i) => (
                <JobCard
                  key={`${job.source}-${job.url}-${i}`}
                  job={job}
                  onOpen={setOpenJob}
                  applied={appliedUrls.includes(job.url)}
                  saved={savedSet.has(job.url)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <JobModal
        job={openJob}
        onClose={() => setOpenJob(null)}
        onApply={markApplied}
        applied={openJob ? appliedUrls.includes(openJob.url) : false}
        saved={openJob ? savedSet.has(openJob.url) : false}
        onToggleSave={toggleSave}
      />
    </div>
  );
}
