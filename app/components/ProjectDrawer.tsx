"use client";

import { useEffect, useCallback } from "react";
import type { Project } from "@/app/data/projects";

export default function ProjectDrawer({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (project) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, handleKeyDown]);

  if (!project) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] md:w-[640px] bg-white shadow-[var(--shadow-lg)] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Project details: ${project.title}`}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--rule-soft)]">
          <span className="micro text-[var(--accent)]">{project.category}</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--bg-2)] transition-colors"
            aria-label="Close details"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-8 space-y-8">
          <div>
            <h2 className="display text-3xl md:text-4xl leading-[1.05] mb-3">
              {project.title}
            </h2>
            <p className="text-[var(--accent)] font-medium">{project.outcome}</p>
          </div>

          <div>
            <h3 className="micro mb-2">Problem</h3>
            <p className="text-[var(--fg-dim)] leading-relaxed">
              {project.problem}
            </p>
          </div>

          <div>
            <h3 className="micro mb-2">System</h3>
            <p className="text-[var(--fg-dim)] leading-relaxed">
              {project.system}
            </p>
          </div>

          <div>
            <h3 className="micro mb-2">What Makes It Technically Interesting</h3>
            <p className="text-[var(--fg-dim)] leading-relaxed">
              {project.technicalInterest}
            </p>
          </div>

          <div>
            <h3 className="micro mb-3">Stack</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((t) => (
                <span
                  key={t}
                  className="text-[12px] px-3 py-1.5 rounded-full bg-[var(--bg-2)] text-[var(--fg-dim)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="micro mb-2">Proof</h3>
            <div className="flex flex-wrap gap-1.5">
              {project.proofTags.map((pt) => (
                <span
                  key={pt}
                  className="inline-flex items-center gap-1 text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 5.5l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {pt}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-[var(--fg-dim)]">
              {project.proofDescription}
            </p>
          </div>

          <div>
            <h3 className="micro mb-2">Resume Bullet</h3>
            <p className="text-sm text-[var(--fg-dim)] italic leading-relaxed border-l-2 border-[var(--accent)] pl-4 py-1">
              {project.resumeBullet}
            </p>
          </div>

          <div className="pt-4 border-t border-[var(--rule-soft)]">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--fg)] text-white text-sm font-medium hover:bg-[var(--fg)]/90 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
