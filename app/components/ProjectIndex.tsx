"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import {
  filterCategories,
  filterProjects,
  type Project,
} from "@/app/data/projects";

export default function ProjectIndex({
  proofMode,
  onOpenProject,
}: {
  proofMode: boolean;
  onOpenProject: (p: Project) => void;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = filterProjects(activeFilter).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.stack.some((t) => t.toLowerCase().includes(q)) ||
      p.blurb.toLowerCase().includes(q)
    );
  });

  return (
    <section id="projects" className="py-20 md:py-32 bg-[var(--bg-3)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <Reveal>
          <div className="mb-12">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="micro">INDEX</span>
              <span className="flex-1 h-px bg-[var(--rule-soft)]" />
              <span className="micro">ALL PROJECTS</span>
            </div>
            <h2 className="display text-4xl sm:text-6xl md:text-7xl max-w-4xl">
              The full{" "}
              <span className="display-italic">catalogue.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[var(--fg-dim)] text-base md:text-lg leading-relaxed">
              12 public projects across AI/ML, systems, and quant research.
              Filter by domain or search by tech stack.
            </p>
          </div>
        </Reveal>

        {/* Search + Filters */}
        <Reveal delay={60}>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1 max-w-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-mute)]"
                aria-hidden
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 11l3.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search projects or tech stack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--rule)] bg-white text-sm placeholder:text-[var(--fg-mute)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[11px] tracking-wide px-3.5 py-2 rounded-full transition-colors ${
                    activeFilter === cat
                      ? "bg-[var(--fg)] text-white"
                      : "bg-white border border-[var(--rule-soft)] text-[var(--fg-dim)] hover:border-[var(--fg-mute)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={i * 40}>
              <div
                className="group card-lift rounded-[var(--radius-md)] border border-[var(--rule-soft)] bg-white p-5 cursor-pointer h-full flex flex-col"
                onClick={() => onOpenProject(p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenProject(p);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${p.title}`}
              >
                <span className="micro text-[var(--accent)] mb-3">
                  {p.category}
                </span>
                <h3 className="text-lg font-semibold leading-snug mb-2 tracking-[-0.01em]">
                  {p.title}
                </h3>
                <p className="text-[var(--fg-dim)] text-sm leading-relaxed mb-4 flex-1">
                  {p.outcome}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.stack.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[var(--fg-dim)]"
                    >
                      {t}
                    </span>
                  ))}
                  {p.stack.length > 4 && (
                    <span className="text-[10px] tracking-wide px-2 py-0.5 text-[var(--fg-mute)]">
                      +{p.stack.length - 4}
                    </span>
                  )}
                </div>
                {proofMode && p.proofTags.length > 0 && (
                  <div className="flex gap-1 mb-3">
                    {p.proofTags.slice(0, 3).map((pt) => (
                      <span
                        key={pt}
                        className="w-2 h-2 rounded-full bg-[var(--accent)]"
                        title={pt}
                      />
                    ))}
                  </div>
                )}
                <a
                  href={p.github}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-[var(--fg)] link-hover mt-auto"
                >
                  GitHub ↗
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[var(--fg-dim)] py-12">
            No projects match your search. Try a different filter or query.
          </p>
        )}
      </div>
    </section>
  );
}
