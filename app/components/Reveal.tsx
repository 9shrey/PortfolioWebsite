"use client";

import { useEffect, useRef } from "react";

/** Safety net: if the observer never fires (deep link, restored scroll,
 *  reduced-motion quirks), reveal anyway rather than stranding content. */
const FAILSAFE_MS = 1500;

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

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.setTimeout(show, delay);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);

    return () => {
      window.clearTimeout(failsafe);
      io.disconnect();
    };
  }, [delay]);

  return (
    <Tag ref={ref as never} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
