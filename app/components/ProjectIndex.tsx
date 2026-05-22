"use client";

import { useMemo, useState } from "react";
import GlassCard from "./GlassCard";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { filterCategories, filterProjects, type Project } from "@/app/data/projects";

export default function ProjectIndex({
  onOpenProject,
}: {
  onOpenProject: (project: Project) => void;
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return filterProjects(activeFilter).filter((project) => {
      if (!query) return true;
      return (
        project.title.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query) ||
        project.stack.some((item) => item.toLowerCase().includes(query)) ||
        project.blurb.toLowerCase().includes(query)
      );
    });
  }, [activeFilter, search]);

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Project Index"
          kicker={`${filtered.length} shown`}
          title="Systems, not filler."
          text="Filter by domain or stack. Every card here has a real system, proof point, or product angle."
        />

        <GlassCard className="p-4 md:p-6">
          <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(220px,0.8fr)_1.8fr]">
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-mute)]"
                aria-hidden
              >
                <circle cx="7.4" cy="7.4" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="m11.2 11.2 3.1 3.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search projects or stack"
                className="h-12 w-full rounded-full border border-white/70 bg-white/62 py-2 pl-11 pr-4 text-sm font-medium text-[var(--fg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] outline-none transition-colors placeholder:text-[var(--fg-mute)] focus:border-[var(--accent)]"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveFilter(category)}
                  className={`rounded-full px-3.5 py-2 text-sm font-semibold transition-all ${
                    activeFilter === category
                      ? "bg-[var(--fg)] text-white shadow-[0_12px_28px_rgba(17,24,39,0.18)]"
                      : "border border-white/70 bg-white/48 text-[var(--fg-dim)] hover:bg-white/70 hover:text-[var(--fg)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project, index) => (
              <Reveal key={project.slug} delay={index * 30}>
                <ProjectCard project={project} compact onOpen={onOpenProject} />
              </Reveal>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm font-medium text-[var(--fg-dim)]">
              No projects match that filter.
            </p>
          ) : null}
        </GlassCard>
      </div>
    </section>
  );
}
