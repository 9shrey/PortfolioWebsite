"use client";

import { useCallback, useEffect } from "react";
import type { Project } from "@/app/data/projects";
import ProjectVisual from "./ProjectVisual";

export default function ProjectDrawer({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!project) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, handleKeyDown]);

  if (!project) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-slate-950/22 backdrop-blur-md" onClick={onClose} aria-hidden />
      <aside
        className="fixed inset-y-3 right-3 z-[80] w-[calc(100%-1.5rem)] overflow-y-auto rounded-[32px] border border-white/70 bg-white/82 shadow-[0_28px_90px_rgba(15,23,42,0.24)] backdrop-blur-2xl sm:w-[580px] md:right-5 md:inset-y-5"
        role="dialog"
        aria-modal="true"
        aria-label={`Project details: ${project.title}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/65 bg-white/72 px-5 py-4 backdrop-blur-2xl">
          <span className="chip text-[var(--accent)]">{project.category}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/60 text-[var(--fg)] hover:bg-white"
            aria-label="Close project details"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="m4.5 4.5 9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-7 px-5 py-7 md:px-7">
          <div>
            <h2 className="text-3xl font-semibold leading-tight text-[var(--fg)] md:text-4xl">
              {project.title}
            </h2>
            <p className="mt-3 text-base font-semibold text-[var(--accent)]">{project.outcome}</p>
          </div>

          <ProjectVisual project={project} />

          {[
            ["Problem", project.problem],
            ["System", project.system],
            ["Technical interest", project.technicalInterest],
          ].map(([title, text]) => (
            <section key={title} className="rounded-[var(--radius-md)] border border-white/70 bg-white/46 p-5">
              <h3 className="micro mb-3">{title}</h3>
              <p className="text-sm leading-7 text-[var(--fg-dim)]">{text}</p>
            </section>
          ))}

          <section>
            <h3 className="micro mb-3">Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[var(--radius-md)] border border-white/70 bg-white/46 p-5">
            <h3 className="micro mb-3">Evidence</h3>
            <p className="text-sm leading-7 text-[var(--fg-dim)]">{project.proofDescription}</p>
          </section>

          <section className="rounded-[var(--radius-md)] border border-white/70 bg-white/46 p-5">
            <h3 className="micro mb-3">Resume bullet</h3>
            <p className="text-sm leading-7 text-[var(--fg-dim)]">{project.resumeBullet}</p>
          </section>

          <a href={project.github} target="_blank" rel="noreferrer" className="button-primary w-full sm:w-auto">
            View on GitHub
          </a>
        </div>
      </aside>
    </>
  );
}
