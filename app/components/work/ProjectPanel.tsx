import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/app/data/projects";

/** One project presented as a case-study spread: statement on the left,
 *  evidence visual on the right. Shared by the home reel and the mobile
 *  stack so there is exactly one definition of what a project looks like. */
export default function ProjectPanel({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  return (
    <article className="flex h-full flex-col justify-center">
      <div className="flex items-center gap-4 border-b border-[var(--rule-soft)] pb-4">
        <span className="micro !text-[var(--signal)]">
          {String(index + 1).padStart(2, "0")}
          <span className="!text-[var(--fg-mute)]">
            /{String(total).padStart(2, "0")}
          </span>
        </span>
        <span aria-hidden className="h-px flex-1 bg-[var(--rule-soft)]" />
        <span className="micro">{project.category}</span>
      </div>

      <div className="mt-8 grid items-center gap-8 md:mt-10 md:grid-cols-[1fr_1.05fr] md:gap-14">
        <div>
          <h3 className="display text-[clamp(1.9rem,4.2vw,3.1rem)]">
            {project.title}
          </h3>

          <p className="prose-dim mt-5 max-w-[46ch] text-[0.9375rem]">
            {project.blurb}
          </p>

          <p className="mt-6 flex items-baseline gap-2.5 text-sm text-[var(--signal)]">
            <span aria-hidden className="block h-px w-5 bg-[var(--signal)]" />
            {project.outcome}
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-3.5 gap-y-1.5">
            {project.stack.map((item) => (
              <li key={item} className="tag">
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link href={`/work/${project.slug}`} className="btn btn-primary">
              Case study
            </Link>
            {project.github && project.codeStatus === "public" ? (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="link-quiet micro"
              >
                Source ↗
              </a>
            ) : (
              <span className="micro">Private / resume-only</span>
            )}
          </div>
        </div>

        <Link
          href={`/work/${project.slug}`}
          data-cursor="view"
          data-cursor-label="Open"
          className="group relative block overflow-hidden rounded-lg border border-[var(--rule)]"
          tabIndex={-1}
          aria-hidden
        >
          <Image
            src={`/project-visuals/${project.slug}.png`}
            alt=""
            width={600}
            height={380}
            // Hand-authored 3.5KB SVGs — there is nothing for the optimizer
            // to do, and routing them through /_next/image only adds a hop.
            unoptimized
            priority={index === 0}
            className="w-full transition-transform duration-[1.1s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[var(--bg)] opacity-20 transition-opacity duration-[0.6s] group-hover:opacity-0"
          />
        </Link>
      </div>
    </article>
  );
}
