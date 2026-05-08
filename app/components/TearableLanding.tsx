"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

function GateContent() {
  return (
    <div className="tear-full-content">
      <p className="micro mb-6">Portfolio surface</p>
      <h1 className="display mx-auto max-w-5xl text-balance text-[clamp(3.5rem,9vw,8.8rem)]">
        WELCOME, TEAR TO SEE SHREY&apos;S WEBSITE.
      </h1>
      <p className="mx-auto mt-7 max-w-2xl text-base font-medium leading-8 text-[var(--fg-dim)] md:text-lg">
        Pull anywhere across the glass. The page will split open, then settle into the portfolio.
      </p>
      <span className="tear-hint mt-9 inline-flex rounded-full px-5 py-3 text-sm font-semibold">
        Drag to tear
      </span>
    </div>
  );
}

export default function TearableLanding({ onComplete }: { onComplete: () => void }) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const pull = useMotionValue(0);
  const seamY = useMotionValue(50);
  const springPull = useSpring(pull, { stiffness: 170, damping: 20, mass: 0.9 });
  const springSeamY = useSpring(seamY, { stiffness: 130, damping: 24, mass: 0.9 });

  const open = useTransform(springPull, (value) => Math.min(Math.abs(value), 420));
  const leftX = useTransform(open, [0, 420], [0, -520]);
  const rightX = useTransform(open, [0, 420], [0, 520]);
  const leftRotate = useTransform(open, [0, 420], [0, -4]);
  const rightRotate = useTransform(open, [0, 420], [0, 4]);
  const seamOpacity = useTransform(open, [0, 160, 420], [0.2, 0.75, 1]);
  const contentScale = useTransform(open, [0, 420], [1, 0.985]);
  const backdropOpacity = useTransform(open, [0, 420], [1, 0.15]);
  const seamTop = useTransform(springSeamY, (value) => `${value}%`);
  const seamScaleY = useTransform(open, [0, 420], [0.9, 1.25]);

  const complete = () => {
    if (leaving) return;
    setLeaving(true);
    pull.set(520);
    window.setTimeout(onComplete, reduceMotion ? 0 : 720);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") complete();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const reset = () => {
    setDragging(false);
    if (!leaving) pull.set(0);
  };

  return (
    <div
      className={`tear-full-gate fixed inset-0 z-[120] overflow-hidden ${
        leaving ? "is-leaving pointer-events-none" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome. Tear to see Shrey's website."
      onPointerDown={(event) => {
        if (reduceMotion) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start.current = { x: event.clientX, y: event.clientY };
        seamY.set((event.clientY / window.innerHeight) * 100);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (reduceMotion || !start.current) return;
        const dx = event.clientX - start.current.x;
        const dy = event.clientY - start.current.y;
        pull.set(dx);
        seamY.set(((start.current.y + dy * 0.45) / window.innerHeight) * 100);
      }}
      onPointerUp={() => {
        if (reduceMotion) return;
        const amount = Math.abs(pull.get());
        if (amount > Math.min(260, window.innerWidth * 0.22)) {
          complete();
        } else {
          reset();
        }
        start.current = null;
      }}
      onPointerCancel={() => {
        start.current = null;
        reset();
      }}
    >
      <motion.div
        className="tear-full-backdrop"
        style={{ opacity: backdropOpacity }}
      />
      <motion.div
        className="tear-seam"
        style={{
          top: seamTop,
          opacity: seamOpacity,
          scaleY: seamScaleY,
        }}
        aria-hidden
      />

      <motion.div
        className="tear-sheet tear-sheet-left"
        style={
          reduceMotion
            ? undefined
            : {
                x: leftX,
                rotate: leftRotate,
                scale: contentScale,
              }
        }
      >
        <GateContent />
      </motion.div>

      <motion.div
        className="tear-sheet tear-sheet-right"
        style={
          reduceMotion
            ? undefined
            : {
                x: rightX,
                rotate: rightRotate,
                scale: contentScale,
              }
        }
      >
        <GateContent />
      </motion.div>

      <button type="button" className="tear-skip" onClick={complete}>
        Enter
      </button>
      <div className={`tear-cursor-copy ${dragging ? "is-visible" : ""}`} aria-hidden>
        keep pulling
      </div>
    </div>
  );
}
