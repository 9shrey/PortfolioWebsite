"use client";

import { useEffect, useRef } from "react";

/** Safety net: if the observer never fires (deep link, restored scroll,
 *  reduced-motion quirks, a browser that mis-reports intersection on a
 *  transformed ancestor), reveal anyway rather than stranding content. */
const FAILSAFE_MS = 1500;

/** The site's Level-2 section entrance. Deliberately CSS-class based rather
 *  than Framer Motion: `whileInView` re-runs its enter animation on every
 *  route remount and can get stuck at its initial state under Next's router
 *  transition, and a stuck section here means invisible content. */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  as?: React.ElementType;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add("in");

    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const failsafe = window.setTimeout(show, FAILSAFE_MS);
    let delayTimer = 0;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          delayTimer = window.setTimeout(show, delay);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);

    return () => {
      window.clearTimeout(failsafe);
      window.clearTimeout(delayTimer);
      io.disconnect();
    };
  }, [delay]);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
