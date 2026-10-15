"use client";

import { useStore } from "../ui/store";

const LAYER_NAMES = ["M5 Problem", "M4 System", "M3 Why it's interesting", "M2 Challenges", "M1 Retrospect"];

/** The five case-study sections, lit in step with the 3D plates as the
 *  tour scrolls down through this core. */
export default function ChapterLayers({ slug }: { slug: string }) {
  const active = useStore((s) => (s.scene.id === "project" && s.scene.slug === slug ? s.activeLayer : -1));
  return (
    <ol className="chapter-layers" aria-label="Case study sections">
      {LAYER_NAMES.map((l, i) => (
        <li key={l} data-on={active === 4 - i || undefined}>
          {l}
        </li>
      ))}
    </ol>
  );
}
