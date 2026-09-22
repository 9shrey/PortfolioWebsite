"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Reveal from "../motion/Reveal";
import TextReveal from "../motion/TextReveal";
import {
  getCodeStatusLabel,
  projects,
  type Project,
} from "@/app/data/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProjectDetail({ project }: { project: Project }) {
  const figureRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: figureRef,
    offset: ["start end", "end start"],
  });
  // The visual settles as it arrives instead of sitting flat — a small amount
  // of scroll-linked scale reads as depth without turning into parallax soup.
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.08, 1]);

  const sections = [
    ["Problem", project.problem],
    ["System", project.system],
    ["Technical interest", project.technicalInterest],
    ["Challenges", project.challenges],
    ["Evidence", project.proofDescription],
    ["What I'd do differently", project.retrospect],
  ] as const;

  const index = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="shell pb-[clamp(5rem,12vh,9rem)]">
      <div className="pt-[calc(var(--nav-h)+clamp(3rem,8vh,5rem))]">
        <Reveal>
          <Link href="/work" className="link-quiet micro">
            ← All projects
          </Link>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-10 flex items-center gap-5 border-b border-[var(--rule-soft)] pb-5">
            <span className="micro !text-[var(--signal)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span aria-hidden className="h-px flex-1 bg-[var(--rule-soft)]" />
            <span className="micro">{project.category}</span>
          </div>
        </Reveal>

        <TextReveal
          as="h1"
          lines={[project.title]}
          className="display mt-10 max-w-[18ch] text-[clamp(2.1rem,5.6vw,4rem)]"
        />

        <Reveal delay={220}>
          <p className="mt-6 flex items-baseline gap-3 text-[1.0625rem] text-[var(--signal)]">
            <span aria-hidden className="block h-px w-7 bg-[var(--signal)]" />
            {project.outcome}
          </p>
        </Reveal>
      </div>

      <div ref={figureRef} className="mt-14 overflow-hidden rounded-xl border border-[var(--rule)]">
        <motion.div style={reduced ? undefined : { scale }}>
          <Image
            src={project.demoImage ?? `/project-visuals/${project.slug}.png`}
            alt={`Diagram of the ${project.shortTitle} system`}
            width={600}
            height={380}
            unoptimized
            priority
            className="w-full"
          />
        </motion.div>
      </div>

      <div className="mt-16 grid gap-x-16 gap-y-12 lg:grid-cols-[16rem_1fr] lg:items-start">
        {/* Meta rail — sticks alongside the prose on wide viewports so the
            stack and links stay reachable through a long read. */}
        <aside className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
          <dl className="flex flex-col gap-7">
            <div>
              <dt className="micro">Tests</dt>
              <dd className="numeral mt-2 text-3xl">{project.testCount}</dd>
            </div>
            <div>
              <dt className="micro">Stack</dt>
              <dd className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                {project.stack.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="micro">Proof</dt>
              <dd className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                {project.proofTags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="micro">Code</dt>
              <dd className="mt-2.5">
                {project.github && project.codeStatus === "public" ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="link text-sm"
                  >
                    View on GitHub ↗
                  </a>
                ) : (
                  <span className="text-sm text-[var(--fg-dim)]">
                    {getCodeStatusLabel(project.codeStatus)}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </aside>

        <div className="border-t border-[var(--rule-soft)]">
          {sections.map(([title, text], i) => (
            <Reveal key={title} delay={i * 40}>
              <section className="grid gap-x-8 gap-y-3 border-b border-[var(--rule-soft)] py-8 md:grid-cols-[9rem_1fr]">
                <h2 className="micro pt-1.5">{title}</h2>
                <p className="prose-dim text-[0.9375rem]">{text}</p>
              </section>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal>
        <Link
          href={`/work/${next.slug}`}
          className="group mt-20 block border-t border-[var(--rule-soft)] pt-8"
          data-cursor="view"
          data-cursor-label="Next"
        >
          <span className="micro">Next project</span>
          <div className="mt-3 flex items-baseline justify-between gap-6">
            <motion.span
              className="display text-[clamp(1.6rem,4vw,2.75rem)] transition-colors duration-[var(--d-1)] group-hover:text-[var(--signal)]"
              transition={{ duration: 0.6, ease: EASE }}
            >
              {next.title}
            </motion.span>
            <span
              aria-hidden
              className="shrink-0 text-[var(--fg-mute)] transition-all duration-[var(--d-1)] group-hover:translate-x-1.5 group-hover:text-[var(--signal)]"
            >
              →
            </span>
          </div>
        </Link>
      </Reveal>
    </article>
  );
}
