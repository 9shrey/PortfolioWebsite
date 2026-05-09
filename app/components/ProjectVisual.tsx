import type { Project } from "@/app/data/projects";
import Image from "next/image";

export default function ProjectVisual({
  project,
  compact = false,
}: {
  project: Project;
  compact?: boolean;
}) {
  const src = project.demoImage ?? `/project-visuals/${project.slug}.svg`;

  return (
    <figure className={`project-visual ${compact ? "mb-5 h-44" : "mb-6 h-56"}`}>
      <Image
        src={src}
        alt={`${project.title} visual preview`}
        fill
        sizes={compact ? "(min-width: 1280px) 28vw, (min-width: 768px) 42vw, 90vw" : "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"}
        className="project-visual-image"
      />
      <figcaption className="project-visual-caption">
        <span>{project.category}</span>
        <strong>{project.outcome}</strong>
      </figcaption>
    </figure>
  );
}
