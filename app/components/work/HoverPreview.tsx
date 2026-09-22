"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useEffect } from "react";
import { useMediaQuery } from "../motion/useMediaQuery";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A project visual that trails the cursor while a row is hovered.
 *
 *  Rendered once at the list level rather than per row, so switching rows
 *  cross-fades a single element instead of mounting and unmounting four. The
 *  spring lag is what sells it — a preview pinned exactly to the pointer
 *  reads as a bug, not as motion.
 *
 *  Never mounts without a fine pointer: there is no hover on touch, and it
 *  would just be four unused image downloads. */
export default function HoverPreview({ slug }: { slug: string | null }) {
  const fine = useMediaQuery("(pointer: fine)");
  const reduced = useReducedMotion();
  const ok = fine && !reduced;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (!ok) return;

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [ok, x, y]);

  if (!ok) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] hidden lg:block"
      style={{ x: sx, y: sy }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <AnimatePresence mode="wait">
          {slug ? (
            <motion.div
              key={slug}
              initial={{ opacity: 0, scale: 0.94, clipPath: "inset(12% 0 12% 0)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0 0% 0)" }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
              transition={{ duration: 0.6, ease: EASE }}
              className="overflow-hidden rounded-lg border border-[var(--rule)] shadow-2xl shadow-black/50"
            >
              <Image
                src={`/project-visuals/${slug}.png`}
                alt=""
                width={600}
                height={380}
                unoptimized
                className="w-[clamp(300px,26vw,420px)]"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
