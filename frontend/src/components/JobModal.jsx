import { IconX, IconExternal, IconBookmark } from "./icons";

export default function JobModal({ job, onClose, onApply, applied, saved, onToggleSave }) {
  if (!job) return null;

  const hasValidUrl = job.url && /^https?:\/\//i.test(job.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong rounded-[28px] border border-white/60 max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-xl text-ink">{job.title}</h2>
            <p className="text-ink/60">{job.company}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleSave(job)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${saved ? "text-coral2 bg-coral/10" : "text-ink/40 hover:bg-white/60"}`}
              title={saved ? "Remove from saved" : "Save job"}
            >
              <IconBookmark filled={saved} style={{ width: 15, height: 15 }} />
            </button>
            <button onClick={onClose} className="text-ink/40 hover:text-ink w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/60">
              <IconX style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        <span className="inline-block text-[11px] font-medium rounded-full bg-coral/10 text-coral2 px-2.5 py-1 mb-4">
          Source: {job.source}
        </span>

        <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
          {job.location && <div><dt className="text-ink/35 text-xs uppercase tracking-wide">Location</dt><dd className="text-ink">{job.location}</dd></div>}
          {job.experience && <div><dt className="text-ink/35 text-xs uppercase tracking-wide">Experience</dt><dd className="text-ink">{job.experience}</dd></div>}
          {job.salary && <div><dt className="text-ink/35 text-xs uppercase tracking-wide">Salary</dt><dd className="text-ink">{job.salary}</dd></div>}
          {job.employment_type && <div><dt className="text-ink/35 text-xs uppercase tracking-wide">Type</dt><dd className="text-ink">{job.employment_type}</dd></div>}
          {job.work_mode && <div><dt className="text-ink/35 text-xs uppercase tracking-wide">Work mode</dt><dd className="text-ink">{job.work_mode}</dd></div>}
          {job.posted_date && <div><dt className="text-ink/35 text-xs uppercase tracking-wide">Posted</dt><dd className="text-ink">{job.posted_date}</dd></div>}
        </dl>

        {job.skills?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-ink/35 uppercase tracking-wide mb-1.5">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <span key={s} className="text-xs bg-white/60 text-ink/70 rounded-full px-2.5 py-1">{s}</span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <div className="mb-4">
            <p className="text-xs text-ink/35 uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-ink/80 whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {job.requirements?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-ink/35 uppercase tracking-wide mb-1.5">Requirements</p>
            <ul className="list-disc list-inside text-sm text-ink/80 space-y-0.5">
              {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {hasValidUrl ? (
          <div className="space-y-2">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onApply?.(job)}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-ink text-cream font-medium py-3 hover:bg-ink2 transition-colors shadow-lg shadow-ink/20"
            >
              {applied ? "Open again on " : "Apply / View Original on "}{job.source} <IconExternal style={{ width: 14, height: 14 }} />
            </a>
            <p className="text-xs text-center text-ink/40">
              {applied ? "Marked as applied — this reopens the original listing." : `Opens on ${job.source} in a new tab and marks this "Applied" here.`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-700 bg-red-50/80 border border-red-100 rounded-2xl px-4 py-2.5">
            This listing doesn't have a valid original link — try another result.
          </p>
        )}
      </div>
    </div>
  );
}
