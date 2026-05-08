"use client";

import { useEffect, useState, useCallback } from "react";
import type { Project } from "@/app/data/projects";
import { projects } from "@/app/data/projects";

export default function CommandPalette({
  onSelect,
}: {
  onSelect: (p: Project) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const results = query.trim()
    ? projects.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.stack.some((t) => t.toLowerCase().includes(q))
        );
      })
    : projects;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[index]) {
        onSelect(results[index]);
        setOpen(false);
      }
    },
    [open, results, index, onSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setIndex(0);
    },
    []
  );

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        className="fixed inset-x-0 top-[15%] z-[80] mx-auto max-w-[560px] px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Search projects"
      >
        <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--rule-soft)] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--rule-soft)]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-[var(--fg-mute)] shrink-0"
              aria-hidden
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12.5 12.5L16 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search projects by name, category, or tech stack..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--fg-mute)]"
              autoFocus
              aria-label="Search projects"
            />
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-2)] text-[var(--fg-mute)]">
              ESC
            </kbd>
          </div>

          <div className="max-h-[360px] overflow-y-auto py-2">
            {results.length === 0 ? (
              <p className="text-sm text-[var(--fg-dim)] text-center py-8">
                No projects found.
              </p>
            ) : (
              results.map((p, i) => (
                <button
                  key={p.slug}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 flex items-center gap-4 transition-colors ${
                    i === index ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--bg-2)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <p className="text-xs text-[var(--fg-dim)] truncate">
                      {p.category} · {p.stack.slice(0, 3).join(", ")}
                    </p>
                  </div>
                  <span className="micro text-[var(--accent)]">
                    {p.category.split(" ")[0]}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
