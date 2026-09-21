"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

/** One word's slice of the scroll range. Kept as its own component so each
 *  useTransform is a stable hook call rather than a hook inside a loop. */
function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.18, 1]);

  return (
    <span className="relative mr-[0.28em] inline-block">
      {/* The muted copy stays put so the line never reflows or shifts as the
          bright copy fades in on top of it. */}
      <span aria-hidden className="absolute inset-0 text-[var(--fg-mute)]">
        {children}
      </span>
      <motion.span style={{ opacity }}>{children}</motion.span>
    </span>
  );
}

/** Scroll-linked word ramp: text starts nearly unreadable and resolves word by
 *  word as it travels up the viewport.
 *
 *  Deliberately used exactly ONCE on the site, on the one paragraph that is
 *  actually worth slowing a reader down for. Applied to every paragraph it
 *  stops being an effect and becomes an obstacle. */
export default function ScrollWords({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // Starts once the block is 85% down the viewport, finishes by the time
    // it reaches the upper third — so it resolves while it's comfortably
    // readable, not as it leaves the screen.
    offset: ["start 0.85", "end 0.4"],
  });

  const words = text.split(" ");

  if (reduced) {
    return <p className={className}>{text}</p>;
  }

  return (
    <p ref={ref} className={className}>
      {/* The split-up version is decorative. `aria-label` on a <p> is not
          reliably announced — a paragraph has no role that takes an accessible
          name — so expose the real sentence as visually-hidden text instead. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex flex-wrap">
        {words.map((word, i) => (
          <Word
            key={`${word}-${i}`}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1.6) / words.length]}
          >
            {word}
          </Word>
        ))}
      </span>
    </p>
  );
}
