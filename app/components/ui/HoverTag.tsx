"use client";

import { useEffect, useRef } from "react";
import { live } from "./store";

/** Glass capsule that follows whatever part of the chip the pointer is on.
 *  Position and text are written by the GL pointer into `live.tag`; this
 *  just copies them to the DOM each frame. Decorative — aria-hidden. */
export default function HoverTag() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let last = "";
    const tick = () => {
      const el = ref.current;
      if (el) {
        const t = live.tag;
        el.style.opacity = t.visible ? "1" : "0";
        el.style.transform = `translate3d(${Math.round(t.x + 16)}px, ${Math.round(t.y + 14)}px, 0)`;
        if (t.text !== last) {
          el.textContent = t.text;
          last = t.text;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={ref} className="hovertag" aria-hidden />;
}
