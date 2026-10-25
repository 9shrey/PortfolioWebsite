"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { anchors } from "./anchors";
import type { FigureKey } from "./figures";

/** A box the light field can draw a figure into. Its children are the
 *  static version (SVG or image): what you see before the field boots, with
 *  WebGL off, and in every anchor the field isn't currently drawing. */
export default function FieldAnchor({
  figure,
  className,
  children,
  label,
  priority,
}: {
  figure: FigureKey;
  className?: string;
  children?: ReactNode;
  label?: string;
  /** Wins over plain visibility: a window on top beats the wallpaper. */
  priority?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? anchors.add(ref.current) : undefined), []);
  useEffect(() => anchors.ping(), [priority]);
  return (
    <div ref={ref} className={`anchor ${className ?? ""}`} data-field-anchor={figure} data-field-priority={priority} role={label ? "img" : undefined} aria-label={label}>
      <div className="anchor-still">{children}</div>
    </div>
  );
}
