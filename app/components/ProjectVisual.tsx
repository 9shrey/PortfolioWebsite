import type { Project } from "@/app/data/projects";
import Image from "next/image";

export default function ProjectVisual({ project }: { project: Project }) {
  const src = project.demoImage ?? `/project-visuals/${project.slug}.svg`;

  return (
    <figure className="relative aspect-[600/380] w-full overflow-hidden rounded-[18px] border border-[var(--rule)]">
      <Image
        src={src}
        alt={`${project.title} visual preview`}
        fill
        sizes="(min-width: 640px) 600px, 92vw"
        className="object-cover"
      />
    </figure>
  );
}
