"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import ProjectPanel from "../work/ProjectPanel";
import Reveal from "../motion/Reveal";
import { useMediaQuery } from "../motion/useMediaQuery";
import { projects } from "@/app/data/projects";

/** The site's one cinematic set piece: the section pins and the project
 *  spreads travel sideways as you scroll down.
 *
 *  Only on wide, fine-pointer, motion-allowed viewports. Everywhere else this
 *  renders the exact same panels as an ordinary vertical list — the fallback
 *  is the server-rendered default, and the reel is an enhancement applied
 *  after mount, so nothing depends on JS to be readable.
 *
 *  The horizontal distance is measured rather than assumed, and the section's
 *  height is set to match it, which keeps the mapping between wheel movement
 *  and sideways travel roughly 1:1 instead of the rubbery feel you get from
 *  hardcoding `N * 100vh`. */
export default function WorkReel() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [distance, setDistance] = useState(0);

  // Read as live media queries rather than a one-shot check at mount, so
  // resizing across the breakpoint switches between reel and stack instead of
  // leaving a desktop-width page stuck in the mobile layout.
  const wide = useMediaQuery("(min-width: 1024px)");
  const fine = useMediaQuery("(pointer: fine)");
  const reduced = useReducedMotion();
  const enabled = wide && fine && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const track = trackRef.current;
    if (!track) return;

    const measure = () =>
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // A little spring on the horizontal travel takes the mechanical edge off
  // the scroll linkage without letting it drift out of sync.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 40,
    mass: 0.3,
    restDelta: 0.0005,
  });
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  // Gated on `enabled` alone, NOT on `distance > 0`: the track is what gets
  // measured, so requiring a measurement before rendering it would mean it
  // never renders and the reel silently stays a vertical list forever. The
  // first frame lays out at distance 0 (height: 100vh, x: 0) and the
  // ResizeObserver corrects it immediately — all of it far below the fold.
  const active = enabled;

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative"
      style={active ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div
        className={
          active
            ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
            : "section"
        }
      >
        <div className="shell">
          <Reveal>
            <div className="flex items-end justify-between gap-6 pb-10">
              <h2 className="display t-display max-w-[14ch] balance">
                Selected work
              </h2>
              <Link href="/work" className="link micro shrink-0 pb-2">
                All projects ↗
              </Link>
            </div>
          </Reveal>
        </div>

        {active ? (
          <>
            <div className="overflow-hidden">
              <motion.div
                ref={trackRef}
                className="flex w-max gap-[6vw] pl-[max(var(--gutter),calc((100vw-var(--shell))/2+var(--gutter)))] pr-[12vw]"
                style={{ x }}
              >
                {projects.map((project, i) => (
                  <div
                    key={project.slug}
                    className="w-[min(78vw,980px)] shrink-0"
                  >
                    <ProjectPanel
                      project={project}
                      index={i}
                      total={projects.length}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Scroll-linked position read-out for the reel. A bar that grows
                from the left edge, not a marker positioned by `left` — a
                marker offset by -100% of its own width sits entirely
                off-screen at progress 0, which is exactly when someone is
                most likely to be looking for it. */}
            <div className="shell mt-10 flex items-center gap-5">
              <div className="h-px flex-1 bg-[var(--rule-soft)]">
                <motion.span
                  aria-hidden
                  className="block h-full origin-left bg-[var(--signal)]"
                  style={{ scaleX: smooth }}
                />
              </div>
              <span className="micro shrink-0">
                {String(projects.length).padStart(2, "0")} projects
              </span>
            </div>
          </>
        ) : (
          <div className="shell flex flex-col gap-20 md:gap-28">
            {projects.map((project, i) => (
              <Reveal key={project.slug}>
                <ProjectPanel
                  project={project}
                  index={i}
                  total={projects.length}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
