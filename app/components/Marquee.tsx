"use client";

export default function Marquee({
  items,
  reverse = false,
}: {
  items: string[];
  reverse?: boolean;
}) {
  // Duplicate the list so the -50% translate produces a seamless loop.
  const row = [...items, ...items];
  return (
    <div
      aria-hidden
      className="marquee-wrap border-y border-[color:var(--rule)] py-4 md:py-5 overflow-hidden bg-[color:var(--bg-2)]/40"
    >
      <div
        className="marquee-track flex gap-12 whitespace-nowrap will-change-transform"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {row.map((it, i) => (
          <span
            key={i}
            className="display text-3xl md:text-5xl text-[color:var(--fg-dim)] inline-flex items-center gap-12"
          >
            {it}
            <span className="display-italic text-[color:var(--accent)]">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
