/* Blue ballpoint marks drawn over the printed page: underlines, rings and
   arrows. Each path has pathLength=1, so CSS can draw it in with one
   dash animation whatever its real length (see .pen in art.css). The
   shapes are deliberately a little crooked; a ruler-straight line would
   read as a font, not a hand. */

type Mark = "underline" | "double" | "ring" | "arrow" | "arrow-down" | "tick" | "squiggle";

const PATHS: Record<Mark, { box: string; d: string[] }> = {
  underline: { box: "0 0 300 16", d: ["M3 11 C 48 6, 101 3, 158 6 S 252 12, 297 4"] },
  double: {
    box: "0 0 300 22",
    d: ["M3 8 C 60 4, 120 3, 180 5 S 262 9, 297 5", "M12 17 C 70 13, 140 12, 205 14 S 270 18, 290 13"],
  },
  ring: {
    box: "0 0 300 100",
    d: ["M168 9 C 78 2, 8 22, 10 52 C 12 84, 112 96, 204 88 C 286 80, 302 42, 262 20 C 224 2, 142 4, 92 16"],
  },
  arrow: { box: "0 0 140 60", d: ["M4 46 C 30 18, 76 8, 128 22", "M110 8 L 130 23 L 108 34"] },
  "arrow-down": { box: "0 0 60 120", d: ["M30 4 C 14 36, 44 70, 28 112", "M14 94 L 28 114 L 44 96"] },
  tick: { box: "0 0 40 34", d: ["M3 18 L 14 30 L 37 4"] },
  squiggle: { box: "0 0 300 18", d: ["M3 9 q 12 -10 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0"] },
};

export default function Pen({
  mark,
  className,
  delay = 0,
  width,
}: {
  mark: Mark;
  className?: string;
  /** Seconds to wait before drawing, once in view. */
  delay?: number;
  width?: number;
}) {
  const p = PATHS[mark];
  return (
    <svg
      className={`pen pen-${mark}${className ? ` ${className}` : ""}`}
      viewBox={p.box}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      style={{ "--pd": `${delay}s`, ...(width ? { width } : null) } as React.CSSProperties}
    >
      {p.d.map((d, i) => (
        <path key={i} d={d} pathLength={1} style={{ "--pi": i } as React.CSSProperties} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/** A handwritten note in the margin. */
export function Note({ children, className, tilt = -3 }: { children: React.ReactNode; className?: string; tilt?: number }) {
  return (
    <span className={`note${className ? ` ${className}` : ""}`} style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}>
      {children}
    </span>
  );
}
