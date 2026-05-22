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
          title="AI systems with evidence, workflows, and product edges."
          text="A focused set of RAG evaluation, agentic automation, AI product, fairness planning, and MLOps systems. Public code is linked where verified; private resume work is marked honestly."
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
