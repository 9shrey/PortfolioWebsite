"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ElementType } from "react";

const MASK: Variants = {
  hidden: { y: "110%" },
  show: (i: number) => ({
    y: "0%",
    transition: {
      duration: 1.1, // --d-3
      ease: [0.16, 1, 0.3, 1],
      delay: 0.06 + i * 0.075,
    },
  }),
};

/** Headline reveal: each line sits in an overflow-hidden track and slides up
 *  from below, staggered. This is the site's Level-3 type entrance.
 *
 *  Accessibility: the animated spans are aria-hidden and the real string is
 *  exposed once via aria-label, so a screen reader reads one clean heading
 *  instead of a pile of fragments. */
export default function TextReveal({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  delay = 0,
  animate = true,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Set false to hold at the hidden state until a parent triggers it. */
  animate?: boolean;
}) {
  const reduced = useReducedMotion();
  const label = lines.join(" ");

  if (reduced) {
    return (
      <Tag className={className}>
        {lines.map((line) => (
          <span key={line} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className} aria-label={label}>
      {lines.map((line, i) => (
        <span
          key={`${line}-${i}`}
          aria-hidden
          // Slight vertical padding keeps descenders (g, y, p) from being
          // clipped by the mask.
          className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span
            className={`block ${lineClassName}`}
            variants={MASK}
            custom={i + delay}
            initial="hidden"
            animate={animate ? "show" : "hidden"}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
