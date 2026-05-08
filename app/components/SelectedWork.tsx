"use client";

import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import SectionHeader from "./SectionHeader";
import { getSelectedProjects, type Project } from "@/app/data/projects";

export default function SelectedWork({
  onOpenProject,
}: {
  onOpenProject: (project: Project) => void;
}) {
  const selected = getSelectedProjects();

  return (
    <section id="work" className="py-16 md:py-24">
      <div className="container-shell">
        <SectionHeader
          eyebrow="Selected Work"
          kicker="Six systems"
          title="Production-style AI systems with measurable edges."
          text="A curated set of RAG, agentic automation, MLOps, backend, and quantitative ML projects. Each card keeps the hiring signal visible: what it does, what proves it, and where the code lives."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selected.map((project, index) => (
            <Reveal key={project.slug} delay={index * 45}>
              <ProjectCard project={project} onOpen={onOpenProject} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
