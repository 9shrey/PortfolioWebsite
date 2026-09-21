"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Field from "./Field";
import TextReveal from "../motion/TextReveal";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Instrument-panel readout under the fold line. Facts only — every value
 *  here is already stated elsewhere on the site. */
const READOUT = [
  { k: "Currently", v: "Agneyas Labs", d: "MLOps Engineer" },
  { k: "Previously", v: "NetApp", d: "ML Intern" },
  { k: "Focus", v: "ML systems", d: "Kernels → services" },
];

export default function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Gentle departure: the type drifts up and dims slightly faster than the
  // page scrolls, so the hero feels like it's being left behind rather than
  // simply scrolling off.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const style = reduced ? undefined : { y, opacity };

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[var(--nav-h)]"
    >
      <Field />

      <motion.div className="shell relative z-10 flex flex-1 flex-col justify-center py-12" style={style}>
        {/* Top meta rail */}
        <motion.div
          className="flex items-center justify-between gap-4 border-b border-[var(--rule-soft)] pb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="micro">AI / ML Engineer</span>
          <span className="micro flex items-center gap-2">
            <span
              aria-hidden
              className="block h-1 w-1 rounded-full bg-[var(--signal)]"
            />
            Bengaluru, IN
          </span>
        </motion.div>

        {/* The name. Two masked lines, the site's single largest gesture. */}
        <TextReveal
          as="h1"
          lines={["Shrey", "Singh"]}
          className="display hero-type mt-10 md:mt-14"
        />

        {/* Positioning statement, offset right so the composition isn't a
            centred stack of blocks. */}
        <motion.div
          className="mt-10 flex justify-end md:mt-14"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.55 }}
        >
          <p className="lead max-w-[34ch] text-[var(--fg)] md:max-w-[38ch]">
            I build ML systems that have to{" "}
            <span className="display italic text-[var(--signal)]">
              actually run
            </span>{" "}
            — from GPU kernel optimisation and PyTorch training through to
            FastAPI services and deployed tooling.
          </p>
        </motion.div>
      </motion.div>

      {/* Readout strip — the fold line of the page */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
      >
        <div className="horizon" />
        <div className="shell grid grid-cols-2 gap-x-8 gap-y-6 py-7 md:grid-cols-4">
          {READOUT.map((item, i) => (
            <div key={item.k}>
              <p className="micro">
                <span className="!text-[var(--signal)]">
                  {String(i + 1).padStart(2, "0")}
                </span>{" "}
                {item.k}
              </p>
              <p className="mt-2 text-sm text-[var(--fg)]">{item.v}</p>
              <p className="caption mt-1 block">{item.d}</p>
            </div>
          ))}

          <div className="flex items-end justify-start md:justify-end">
            <a
              href="#ledger"
              className="micro group flex items-center gap-3 transition-colors hover:!text-[var(--signal)]"
            >
              Scroll
              <span aria-hidden className="scroll-cue" />
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
