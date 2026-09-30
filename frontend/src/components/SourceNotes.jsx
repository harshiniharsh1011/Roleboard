import { useState } from "react";
import { IconChevronDown } from "./icons";

const LEVEL_STYLES = {
  restricted: "bg-white/60 text-ink/50",
  empty: "bg-coral/10 text-coral2",
  blocked: "bg-coral/10 text-coral2",
  error: "bg-red-50/80 text-red-700",
};

export default function SourceNotes({ notes }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(notes || {});
  if (entries.length === 0) return null;

  const restrictedCount = entries.filter(([, n]) => n.level === "restricted").length;
  const issueCount = entries.length - restrictedCount;

  return (
    <div className="glass rounded-2xl border border-white/60 overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-ink/60">
        <span>
          {entries.length} source{entries.length > 1 ? "s" : ""} without results
          {restrictedCount > 0 && ` · ${restrictedCount} restricted by ToS`}
          {issueCount > 0 && ` · ${issueCount} had an issue`}
        </span>
        <IconChevronDown style={{ width: 13, height: 13 }} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-white/50 pt-2">
          {entries.map(([source, note]) => (
            <p key={source} className={`text-xs rounded-xl px-3 py-2 ${LEVEL_STYLES[note.level] || LEVEL_STYLES.error}`}>
              <span className="font-medium">{source}:</span> {note.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
