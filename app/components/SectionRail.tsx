"use client";

import { useEffect, useState } from "react";

const items = [
  { id: "top", n: "00" },
  { id: "about", n: "I" },
  { id: "projects", n: "II" },
  { id: "toolkit", n: "III" },
  { id: "contact", n: "IV" },
];

export default function SectionRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to top that's intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <aside
      aria-hidden
      className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 z-30 flex-col gap-5"
    >
      {items.map((i) => {
        const on = active === i.id;
        return (
          <a
            key={i.id}
            href={`#${i.id}`}
            className="group flex items-center gap-3 justify-end"
          >
            <span
              className={`micro transition-opacity duration-300 ${
                on ? "opacity-100" : "opacity-0 group-hover:opacity-60"
              }`}
            >
              {i.n}
            </span>
            <span
              className={`block h-px transition-all duration-500 ${
                on
                  ? "w-10 bg-[color:var(--fg)]"
                  : "w-5 bg-[color:var(--fg-mute)] group-hover:bg-[color:var(--fg-dim)]"
              }`}
            />
          </a>
        );
      })}
    </aside>
  );
}
