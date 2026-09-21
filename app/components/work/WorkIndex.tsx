"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../ui/PageHeader";
import HoverPreview from "./HoverPreview";
import Reveal from "../motion/Reveal";
import { filterCategories, filterProjects, projects } from "@/app/data/projects";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function WorkIndex() {
  const [active, setActive] = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);

  const shown = useMemo(() => filterProjects(active), [active]);

  // Counts sit next to each filter so the list's shape is legible before you
  // click — and an empty filter can't be a surprise.
  const counts = useMemo(
    () =>
      Object.fromEntries(
        filterCategories.map((c) => [c, filterProjects(c).length])
      ) as Record<string, number>,
    []
  );

  return (
    <>
      <HoverPreview slug={hovered} />

      <div className="shell pb-[clamp(5rem,12vh,9rem)]">
        <PageHeader
          kicker="Work"
          meta={`${projects.length} systems`}
          lines={["Systems, not filler."]}
          lead="Four builds, each with the evidence that it works: test counts, leak-proof evaluation, and correctness gates rather than screenshots. Open any one for the problem, the system design, and what I'd do differently."
        />

        <Reveal delay={260}>
          <div
            className="mt-16 flex flex-wrap gap-x-7 gap-y-2"
            role="group"
            aria-label="Filter projects by focus"
          >
            {filterCategories.map((category) => (
              <button
                key={category}
                type="button"
                className="pill"
                data-active={active === category}
                aria-pressed={active === category}
                onClick={() => setActive(category)}
              >
                {category}
                <sup className="ml-1 text-[0.6em] opacity-60">
                  {counts[category]}
                </sup>
              </button>
            ))}
          </div>
        </Reveal>

        <div
          className="index-list mt-10 border-b border-[var(--rule-soft)]"
          onMouseLeave={() => setHovered(null)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((project, i) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                transition={{ duration: 0.45, ease: EASE, delay: i * 0.05 }}
              >
                <Link
                  href={`/work/${project.slug}`}
                  className="index-row group py-7 md:py-9"
                  data-cursor="view"
                  data-cursor-label="Case study"
                  onMouseEnter={() => setHovered(project.slug)}
                  onFocus={() => setHovered(null)}
                >
                  <div className="grid gap-x-8 gap-y-3 md:grid-cols-[3rem_1fr_auto] md:items-baseline">
                    <span className="micro pt-1.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h2 className="row-title display text-[clamp(1.6rem,3.4vw,2.4rem)]">
                        {project.title}
                      </h2>
                      <p className="prose-dim mt-2.5 max-w-[58ch] text-sm">
                        {project.blurb}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="micro">{project.category}</span>
                        <span aria-hidden className="text-[var(--fg-mute)]">
                          ·
                        </span>
                        {project.stack.slice(0, 4).map((s) => (
                          <span key={s} className="tag">
                            {s}
                          </span>
                        ))}
                        {project.stack.length > 4 ? (
                          <span className="tag">
                            +{project.stack.length - 4}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-5 md:flex-col md:items-end md:gap-2">
                      <span className="micro !text-[var(--signal)]">
                        {project.testCount} tests
                      </span>
                      <span className="tag">
                        {project.codeStatus === "public"
                          ? "Public code"
                          : "Private"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
