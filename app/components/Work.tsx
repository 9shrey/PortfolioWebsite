"use client";

import { useMemo, useState } from "react";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { filterCategories, filterProjects, type Project } from "@/app/data/projects";

export default function Work({
  onOpenProject,
}: {
  onOpenProject: (project: Project) => void;
}) {
  const [active, setActive] = useState("All");
  const shown = useMemo(() => filterProjects(active), [active]);

  return (
    <section id="work" className="py-20 md:py-28">
      <div className="container-shell">
        <SectionHeader
          numeral="I"
          kicker={`${shown.length} projects`}
          title={
            <>
              Systems, not{" "}
              <span className="display-italic text-[var(--accent)]">filler</span>.
            </>
          }
        />

        <Reveal>
          <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1">
            {filterCategories.map((category) => (
              <button
                key={category}
                type="button"
                className="pill"
                data-active={active === category}
                onClick={() => setActive(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="index-list border-b border-[var(--rule-soft)]">
          {shown.map((project, index) => (
            <button
              key={project.slug}
              type="button"
              className="index-row group"
              onClick={() => onOpenProject(project)}
              aria-label={`View details for ${project.title}`}
            >
              <div className="grid gap-x-8 gap-y-3 md:grid-cols-[2.5rem_1fr_auto] md:items-baseline">
                <span className="micro hidden md:block">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="display row-title text-2xl md:text-[1.75rem]">
                    {project.title}
                  </h3>
                  <p className="prose-dim mt-2 max-w-[62ch] text-sm">
                    {project.blurb}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                    {project.stack.slice(0, 5).map((item) => (
                      <span key={item} className="tag">
                        {item}
                      </span>
                    ))}
                    {project.stack.length > 5 ? (
                      <span className="tag">+{project.stack.length - 5}</span>
                    ) : null}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="micro block">{project.category}</span>
                  <span className="tag mt-2 block">
                    {project.codeStatus === "public" ? "Public code" : "Private"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Reveal>
          <p className="prose-dim mt-6 text-sm">
            Select any project for the problem, system design, and evidence
            behind it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
