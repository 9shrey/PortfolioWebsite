import type { Project } from "@/app/data/projects";
import GlassCard from "./GlassCard";
import ProjectVisual from "./ProjectVisual";
import TearablePanel from "./TearablePanel";

export default function ProjectCard({
  project,
  compact = false,
  onOpen,
}: {
  project: Project;
  compact?: boolean;
  onOpen: (project: Project) => void;
}) {
  const reveal = (
    <div className="flex h-full flex-col justify-between p-4 text-left">
      <div>
        <p className="micro mb-3 text-[var(--fg)]">Pull reveal</p>
        <p className="text-sm font-semibold leading-6 text-[var(--fg)]">{project.outcome}</p>
        <p className="mt-3 text-xs font-medium leading-5 text-[var(--fg-dim)]">
          {project.problem}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 5).map((item) => (
          <span key={item} className="rounded-full bg-white/58 px-2 py-1 text-[10px] font-semibold text-[var(--fg-dim)]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <TearablePanel
      className="h-full rounded-[var(--radius-lg)]"
      intensity={compact ? 0.55 : 0.8}
      threshold={compact ? 78 : 92}
      reveal={reveal}
    >
      <GlassCard
        as="article"
        className={`group specular-hover h-full cursor-pointer ${
          compact ? "rounded-[var(--radius-md)] p-5" : "p-6 md:p-7"
        }`}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`View details for ${project.title}`}
          onClick={() => onOpen(project)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpen(project);
            }
          }}
          className="flex h-full flex-col outline-none"
        >
          <ProjectVisual project={project} compact={compact} />
          <div className="mb-5 flex items-start justify-between gap-4">
            <span className="chip text-[var(--accent)]">{project.category}</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/54 text-[var(--fg-dim)] transition-colors group-hover:text-[var(--fg)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M5.5 3.5h7v7M12.5 3.5 3.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>

          <h3 className={`${compact ? "text-lg" : "text-2xl md:text-3xl"} font-semibold leading-tight text-[var(--fg)]`}>
            {project.title}
          </h3>
          <p className="mt-3 text-sm font-semibold text-[var(--accent)]">{project.outcome}</p>
          <p className={`${compact ? "mt-2 text-sm" : "mt-4 text-[15px]"} flex-1 leading-7 text-[var(--fg-dim)]`}>
            {compact ? project.blurb : project.resumeBullet}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.slice(0, compact ? 4 : 6).map((item) => (
              <span key={item} className="chip min-h-7 px-2.5 py-1 text-xs">
                {item}
              </span>
            ))}
            {project.stack.length > (compact ? 4 : 6) ? (
              <span className="chip min-h-7 px-2.5 py-1 text-xs">
                +{project.stack.length - (compact ? 4 : 6)}
              </span>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/60 pt-4">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="text-sm font-semibold text-[var(--fg)] link-hover"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpen(project);
              }}
              className="text-sm font-semibold text-[var(--accent)] link-hover"
            >
              Details
            </button>
          </div>
        </div>
      </GlassCard>
    </TearablePanel>
  );
}
