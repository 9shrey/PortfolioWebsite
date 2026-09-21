"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import PageHeader from "../ui/PageHeader";
import Reveal from "../motion/Reveal";
import { roles } from "@/app/data/experience";

export default function ExperienceView() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.75", "end 0.65"],
  });
  // Damped so the line keeps drawing for a beat after the scroll stops,
  // instead of snapping to a halt the instant the wheel does.
  const draw = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="shell pb-[clamp(5rem,12vh,9rem)]">
      <PageHeader
        kicker="Experience"
        meta="Agneyas Labs · NetApp"
        lines={["Where the work", "has shipped."]}
      />

      <div ref={trackRef} className="relative mt-20">
        {/* The rail and the line that draws down it as you scroll. */}
        <span
          aria-hidden
          className="absolute left-0 top-0 hidden h-full w-px bg-[var(--rule-soft)] md:block"
        />
        <motion.span
          aria-hidden
          className="absolute left-0 top-0 hidden h-full w-px origin-top bg-[var(--signal)] md:block"
          style={{ scaleY: reduced ? 1 : draw }}
        />

        {roles.map((role, i) => (
          <Reveal key={role.company} delay={i * 80}>
            <article className="grid gap-x-10 gap-y-5 border-t border-[var(--rule-soft)] py-10 md:grid-cols-[9rem_1fr] md:pl-8 lg:py-14">
              <div className="md:pt-2">
                <p className="micro !text-[var(--fg)]">
                  {role.from} — {role.to}
                </p>
                <p className="caption mt-1.5 block">{role.location}</p>
              </div>

              <div>
                <h2 className="display text-[clamp(1.5rem,3.2vw,2.2rem)]">
                  {role.title}
                </h2>
                <p className="mt-1.5 text-[1.0625rem] text-[var(--signal)]">
                  {role.company}
                </p>

                <ul className="prose-dim mt-6 max-w-[64ch] space-y-3.5 text-[0.9375rem]">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-4">
                      <span
                        aria-hidden
                        className="mt-[0.68em] h-px w-3.5 shrink-0 bg-[var(--fg-mute)]"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {role.metrics?.length ? (
                  <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5 border-t border-[var(--rule-soft)] pt-6">
                    {role.metrics.map((m) => (
                      <div key={m.label}>
                        <dd className="numeral text-[1.6rem] text-[var(--fg)]">
                          {m.value}
                        </dd>
                        <dt className="caption mt-1.5 block max-w-[18ch]">{m.label}</dt>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <div className="mt-7 flex flex-wrap gap-x-3.5 gap-y-1.5">
                  {role.stack.map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
