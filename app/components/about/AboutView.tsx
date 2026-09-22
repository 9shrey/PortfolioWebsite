"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PageHeader from "../ui/PageHeader";
import Reveal from "../motion/Reveal";
import { skillGroups } from "@/app/data/skills";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function AboutView() {
  const [open, setOpen] = useState(0);

  return (
    <div className="shell pb-[clamp(5rem,12vh,9rem)]">
      <PageHeader
        kicker="About"
        meta="Bengaluru, IN"
        lines={["About me"]}
        lead="I'm an AI/ML engineer, and I work across the whole span of a model's life — GPU kernels and feature pipelines at one end, FastAPI services and dashboards at the other. Right now I'm an MLOps Engineer at Agneyas Labs, building an internal AutoML platform and a hybrid battery digital twin. Before that I was an ML intern at NetApp, working on revenue forecasting for $150M+ quarterly planning."
      />

      {/* Capabilities as a focused list rather than a wall of badges: one
          group is open at a time, so the page always has a subject. */}
      <section className="mt-24">
        <Reveal>
          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--rule-soft)] pb-5">
            <h2 className="display t-title">What I work with</h2>
            <span className="micro shrink-0">
              {skillGroups.length} groups
            </span>
          </div>
        </Reveal>

        <div className="index-list">
          {skillGroups.map((group, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={group.label} delay={i * 60}>
                <div className="index-row">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={`group-${i}`}
                      className="flex w-full items-baseline justify-between gap-6 py-7 text-left"
                    >
                      <span className="flex items-baseline gap-5">
                        <span className="micro">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="row-title display text-[clamp(1.5rem,3.4vw,2.25rem)]"
                          style={{ color: isOpen ? "var(--signal)" : undefined }}
                        >
                          {group.label}
                        </span>
                      </span>
                      <motion.span
                        aria-hidden
                        className="shrink-0 text-[var(--fg-mute)]"
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                      >
                        +
                      </motion.span>
                    </button>
                  </h3>

                  <motion.div
                    id={`group-${i}`}
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-x-10 gap-y-4 pb-9 md:grid-cols-[1fr_1.4fr]">
                      <p className="prose-dim max-w-[36ch] text-sm">
                        {group.note}
                      </p>
                      <ul className="flex flex-wrap gap-x-5 gap-y-2.5 self-start">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="text-sm text-[var(--fg-dim)] transition-colors duration-[var(--d-1)] hover:text-[var(--fg)]"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Reveal>
        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-4">
          <a
            href="/Shrey_Singh_Resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Resume ↗
          </a>
          <Link href="/work" className="link micro">
            See the work
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
