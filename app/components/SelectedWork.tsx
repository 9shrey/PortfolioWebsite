"use client";

import Reveal from "./Reveal";
import { getSelectedProjects, type Project } from "@/app/data/projects";

const proofLabels: Record<string, string> = {
  tests: "Tested",
  Docker: "Docker",
  CI: "CI/CD",
  evals: "Evaluated",
  architecture: "Architected",
  observability: "Observable",
  reproducible: "Reproducible",
};

function ProjectCard({
  project,
  index,
  proofMode,
  onOpen,
}: {
  project: Project;
  index: number;
  proofMode: boolean;
  onOpen: (p: Project) => void;
}) {
  return (
    <Reveal delay={index * 60}>
      <article
        className="group card-lift rounded-[var(--radius-lg)] border border-[var(--rule-soft)] bg-[var(--bg)] overflow-hidden cursor-pointer"
        onClick={() => onOpen(project)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(project);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${project.title}`}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <span className="micro text-[var(--accent)]">
              {project.category}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-[var(--fg-mute)] group-hover:text-[var(--fg)] transition-colors"
              aria-hidden
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3 className="display text-2xl md:text-3xl leading-[1.1] mb-2 tracking-[-0.01em]">
            {project.title}
          </h3>

          <p className="text-[var(--accent)] text-sm font-medium mb-3">
            {project.outcome}
          </p>

          <p className="text-[var(--fg-dim)] text-[15px] leading-relaxed mb-6">
            {project.blurb}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.stack.map((t) => (
              <span
                key={t}
                className="inline-block text-[11px] tracking-wide px-2.5 py-1 rounded-full bg-[var(--bg-2)] text-[var(--fg-dim)]"
              >
                {t}
              </span>
            ))}
          </div>

          {proofMode && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.proofTags.map((pt) => (
                <span
                  key={pt}
                  className="inline-flex items-center gap-1 text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"
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
                  {proofLabels[pt] || pt}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[var(--rule-soft)]">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-medium text-[var(--fg)] link-hover"
            >
              View on GitHub ↗
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen(project);
              }}
              className="text-[13px] text-[var(--accent)] font-medium link-hover"
            >
              Details
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function SelectedWork({
  proofMode,
  onOpenProject,
}: {
  proofMode: boolean;
  onOpenProject: (p: Project) => void;
}) {
  const selected = getSelectedProjects();

  return (
    <section id="work" className="py-20 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <Reveal>
          <div className="border-t border-[var(--rule-soft)] pt-8 md:pt-12 mb-4">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="micro">SELECTED</span>
              <span className="flex-1 h-px bg-[var(--rule-soft)]" />
              <span className="micro">WORK</span>
            </div>
            <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-4xl">
              Six things I&apos;ve{" "}
              <span className="display-italic">shipped.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[var(--fg-dim)] text-base md:text-lg leading-relaxed">
              Research-grade projects across RAG, agents, MLOps, and
              quantitative ML — each with tests, documentation, and
              reproducible artifacts.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-4 md:gap-5">
          {selected.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={i}
              proofMode={proofMode}
              onOpen={onOpenProject}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
