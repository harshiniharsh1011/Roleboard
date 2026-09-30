import { useState } from "react";
import { IconPin, IconBriefcase, IconCoin, IconHome, IconExternal, IconCheck, IconBookmark, IconCopy } from "./icons";

export default function JobCard({ job, onOpen, applied, saved, onToggleSave }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(job.url || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore, it's a convenience feature
    }
  };

  return (
    <div className="glass rounded-2xl border border-white/60 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 relative">
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        {applied && (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50/90 rounded-full px-2 py-1 flex items-center gap-1">
            <IconCheck style={{ width: 10, height: 10 }} /> Applied
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(job); }}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${saved ? "text-coral2 bg-coral/10" : "text-ink/30 hover:bg-white/70"}`}
          title={saved ? "Remove from saved" : "Save job"}
        >
          <IconBookmark filled={saved} style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <div className="pr-16">
        <h3 className="font-display text-lg text-ink leading-snug">{job.title}</h3>
        <p className="text-sm text-ink/50">{job.company}</p>
      </div>

      <span className="self-start text-[11px] font-medium rounded-full bg-coral/10 text-coral2 px-2.5 py-1">{job.source}</span>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/60">
        {job.location && <span className="flex items-center gap-1"><IconPin style={{ width: 15, height: 15 }} />{job.location}</span>}
        {job.experience && <span className="flex items-center gap-1"><IconBriefcase style={{ width: 15, height: 15 }} />{job.experience}</span>}
        {job.salary && <span className="flex items-center gap-1"><IconCoin style={{ width: 15, height: 15 }} />{job.salary}</span>}
        {job.work_mode && <span className="flex items-center gap-1"><IconHome style={{ width: 15, height: 15 }} />{job.work_mode}</span>}
      </div>

      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((s) => (
            <span key={s} className="text-xs bg-white/60 text-ink/60 rounded-full px-2.5 py-1">{s}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/50">
        <span className="text-xs text-ink/35">{job.posted_date || "Date not listed"}</span>
        <div className="flex items-center gap-3">
          <button onClick={copyLink} className="text-ink/40 hover:text-ink/70 text-xs flex items-center gap-1" title="Copy link">
            <IconCopy style={{ width: 13, height: 13 }} />{copied ? "Copied" : ""}
          </button>
          <button onClick={() => onOpen(job)} className="text-sm font-medium text-coral2 flex items-center gap-1 hover:underline">
            View Job <IconExternal style={{ width: 12, height: 12 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
