"use client";

import { useCallback, useEffect } from "react";
import { getCodeStatusLabel, type Project } from "@/app/data/projects";
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

  const sections = [
    ["Problem", project.problem],
    ["System", project.system],
    ["Technical interest", project.technicalInterest],
    ["Evidence", project.proofDescription],
  ] as const;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-[80] w-full overflow-y-auto border-l border-[var(--rule)] bg-[var(--bg-2)] sm:w-[600px]"
        role="dialog"
        aria-modal="true"
        aria-label={`Project details: ${project.title}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--rule-soft)] bg-[var(--bg-2)]/95 px-6 py-4 backdrop-blur-md">
          <span className="micro">{project.category}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rule)] text-[var(--fg-dim)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            aria-label="Close project details"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="m4.5 4.5 9 9M13.5 4.5l-9 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-8 md:px-8">
          <h2 className="display text-[clamp(1.9rem,5vw,2.6rem)]">
            {project.title}
          </h2>
          <p className="mt-3 text-sm text-[var(--accent)]">{project.outcome}</p>

          <div className="mt-8">
            <ProjectVisual project={project} />
          </div>

          <div className="mt-2 border-b border-[var(--rule-soft)]">
            {sections.map(([title, text]) => (
              <div
                key={title}
                className="grid gap-x-6 gap-y-2 border-t border-[var(--rule-soft)] py-5 md:grid-cols-[7rem_1fr]"
              >
                <h3 className="micro pt-1">{title}</h3>
                <p className="prose-dim text-sm">{text}</p>
              </div>
            ))}

            <div className="grid gap-x-6 gap-y-2 border-t border-[var(--rule-soft)] py-5 md:grid-cols-[7rem_1fr]">
              <h3 className="micro pt-1">Stack</h3>
              <p className="text-sm leading-relaxed text-[var(--fg-dim)]">
                {project.stack.join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-8">
            {project.github && project.codeStatus === "public" ? (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                View on GitHub
              </a>
            ) : (
              <p className="micro">{getCodeStatusLabel(project.codeStatus)}</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
